from odoo import fields, _, models, api
from io import BytesIO
from datetime import datetime, timedelta
import xlsxwriter
import pytz

class PosMarginReport(models.TransientModel):
    _name = "pos.report.margin"
    _description = "Report margin POS"

    date_from = fields.Date(string="Fecha Inicio", required=True)
    date_to = fields.Date(string="Fecha Fin", required=True)
    user_ids = fields.Many2many('res.users', 'pos_user_margin', string="Usuarios")
    product_ids = fields.Many2many('product.product', 'pos_product_margin', string="Productos")
    pos_config_ids = fields.Many2many('pos.config', 'pos_margin_configs', string="Punto de Venta")
    order = fields.Selection(selection=[('desc',"Mas Vendido"),('asc', "Menos Vendido")], string="Orden", default="desc")

    def print_report_xlsx(self):
        return {
            'type': 'ir.actions.act_url',
            'url': 'reports/format/{}/{}/{}'.format(self._name, 'xlsx', self.id),
            'target': 'new'
        }

    def file_name(self, file_format):
        file_name = "Margen de Venta POS.%s" %file_format
        return file_name

    def document_print(self):
        output = BytesIO()
        output = self._init_buffer_report(output)
        # output.seek(0)
        return output.getvalue()
        # return output.read()

    def _init_buffer_report(self, output):
        workbook = xlsxwriter.Workbook(output, {'in_memory':True})
        # Estilos
        cabeceras = workbook.add_format({'font_size': 13, 'valign': 'vcenter', 'align': 'center', 'text_wrap': True, 'bold': True, 'font_name': 'Cambria', 'text_wrap': True, 'left': True, 'right': True, 'bottom': True, 'top': True, 'bg_color': 'black', 'font_color': 'white'})
        number_right = workbook.add_format({'font_size': 12, 'align': 'left', 'num_format': '#,##0.00', 'font_name': 'Calibri'})
        number_right = workbook.add_format({'font_size': 12, 'align': 'right', 'num_format': '#,##0.00', 'font_name': 'Calibri'})
        totales = workbook.add_format({'font_size': 14, 'align': 'center', 'font_name': 'Cambria', 'bold': True, 'font_color': 'red'})


        # values
        detail, summary = self._get_values()

        # resumido
        #################################-------------################################3
        ws = workbook.add_worksheet("Margen Resumido")
        ws.set_column('A:A', 45,)
        ws.set_column('B:B', 25,number_right)
        ws.set_column('C:C', 25,number_right)
        ws.set_column('D:D', 40,number_right)
        ws.set_column('E:E', 40,number_right)
        ws.set_column('F:F', 40,number_right)
        ws.set_column('G:G', 40,number_right)

        ws.write(0,0, 'Punto de Venta', cabeceras)
        ws.write(0,1, 'Total Venta', cabeceras)
        ws.write(0,2, 'Total Venta + IVA', cabeceras)
        ws.write(0,3, 'Total IVA', cabeceras)
        ws.write(0,4, 'Total Costo', cabeceras)
        ws.write(0,5, 'Margen de Ganancia + IVA', cabeceras)
        ws.write(0,6, 'Margen de Ganancia', cabeceras)
        ws.freeze_panes(1, 0) # # Freeze the row and column
        ws.autofilter("A1:G%s" %(len(summary)+1))
        row = 0
        for s in summary:
            row += 1
            ws.write(row,0, s['name_config'])
            ws.write(row,1, s['total_sale'])
            ws.write(row,2, s['total_sale_tax_incl'])
            ws.write(row,3, s['total_tax'])
            ws.write(row,4, s['total_cost'])
            ws.write(row,5, s['margin_tax_incl'])
            ws.write(row,6, s['margin'])

        # Detallado
        #################################-------------################################3
        ws2 = workbook.add_worksheet("Margen Detallado")
        ws2.set_column('A:A', 20)
        ws2.set_column('B:B', 35)
        ws2.set_column('C:C', 45)
        ws2.set_column('D:D', 25,number_right)
        ws2.set_column('E:E', 25,number_right)
        ws2.set_column('F:F', 25,number_right)
        ws2.set_column('G:G', 25,number_right)
        ws2.set_column('H:H', 25,number_right)
        ws2.set_column('I:I', 25,number_right)
        ws2.set_column('J:J', 25,number_right)
        ws2.set_column('K:K', 40)
        ws2.freeze_panes(1, 0) # # Freeze the row and column
        ws2.autofilter("A1:K%s" %(len(detail)+1))

        ws2.write(0,0, 'Fecha Orden', cabeceras)
        ws2.write(0,1, 'Tarifa', cabeceras)
        ws2.write(0,2, 'Descriptcion', cabeceras)
        ws2.write(0,3, 'Cantidad', cabeceras)
        ws2.write(0,4, 'Costo Venta', cabeceras)
        ws2.write(0,5, 'Total de Ventas', cabeceras)
        ws2.write(0,6, 'Total de Ventas + IVA', cabeceras)
        ws2.write(0,7, 'Total de IVA', cabeceras)
        ws2.write(0,8, 'Margen de Ganancia + IVA', cabeceras)
        ws2.write(0,9, 'Margen de Ganancia', cabeceras)
        ws2.write(0,10, 'Sucursal', cabeceras)

        row = 0
        for d in detail:
            row += 1
            ws2.write(row,0, d['date_order'])
            ws2.write(row,1, d['pricelist'])
            ws2.write(row,2, d['name'])
            ws2.write(row,3, d['qty'])
            ws2.write(row,4, d['total_cost'])
            ws2.write(row,5, d['total_sale'])
            ws2.write(row,6, d['total_sale_tax_incl'])
            ws2.write(row,7, d['total_tax'])
            ws2.write(row,8, d['margin_tax_incl'])
            ws2.write(row,9, d['margin'])
            ws2.write(row,10, d['name_config'])

        workbook.close()
        return output

    def _get_values(self):
        zone_user = self.env.user.tz or 'UTC'
        
        utc_user = pytz.timezone(zone_user)
        utc_now = pytz.timezone('UTC')
        data1 = datetime.now(utc_user).hour
        data2 = datetime.now(utc_now).hour
        interval_hour = abs(data2-data1)
        fields_detail = """
                pt.name AS name,
                pol.qty AS qty,
                pol.total_cost AS total_cost,
                pol.price_subtotal AS total_sale,
                pol.price_subtotal_incl AS total_sale_tax_incl,
                (pol.price_subtotal_incl - pol.price_subtotal) AS total_tax,
                (pol.price_subtotal - pol.total_cost / CASE COALESCE(po.currency_rate, 0) WHEN 0 THEN 1.0 ELSE po.currency_rate END) AS margin,
                (pol.price_subtotal_incl - pol.total_cost / CASE COALESCE(po.currency_rate, 0) WHEN 0 THEN 1.0 ELSE po.currency_rate END) AS margin_tax_incl,
                pg.name AS name_config,
                pp.name AS pricelist,
                to_char((po.date_order AT TIME ZONE 'UTC' - interval '%s hours')::DATE, 'DD/MM/YYYY') AS date_order
        """ % interval_hour
        fields_summary = """
                pg.name AS name_config,
                SUM(pol.price_subtotal) AS total_sale,
                SUM(pol.price_subtotal_incl) AS total_sale_tax_incl,
                SUM(pol.total_cost) AS total_cost,
                SUM(pol.price_subtotal_incl - pol.price_subtotal) AS total_tax,
                SUM(pol.price_subtotal - pol.total_cost / CASE COALESCE(po.currency_rate, 0) WHEN 0 THEN 1.0 ELSE po.currency_rate END) AS margin,
                SUM(pol.price_subtotal_incl - pol.total_cost / CASE COALESCE(po.currency_rate, 0) WHEN 0 THEN 1.0 ELSE po.currency_rate END) AS margin_tax_incl
        """
        query = """
            FROM pos_order_line AS pol
            INNER JOIN pos_order po ON (po.id=pol.order_id)
            LEFT JOIN product_product p ON (pol.product_id=p.id)
            LEFT JOIN product_template pt ON (p.product_tmpl_id=pt.id)
            LEFT JOIN pos_session ps ON (po.session_id=ps.id)
            LEFT JOIN pos_config pg ON (ps.config_id=pg.id)
            """
        condition = " WHERE ((po.date_order AT TIME ZONE 'UTC' - interval '%s hours')::DATE BETWEEN %s AND %s) "
        domain = [interval_hour, self.date_from.strftime('%Y-%m-%d'), self.date_to.strftime('%Y-%m-%d')]
        if self.pos_config_ids:
            condition += " AND (pg.id IN %s ) "
            domain.append(tuple(self.pos_config_ids.ids))
        if self.user_ids:
            condition += " AND (po.user_id IN %s ) "
            domain.append(tuple(self.user_ids.ids))
        if self.product_ids:
            condition += " AND (pol.product_id IN %s ) "
            domain.append(tuple(self.product_ids.ids))

        # detail
        query_detail = "SELECT " + fields_detail + query + ' LEFT JOIN product_pricelist pp ON po.pricelist_id = pp.id ' + condition + " ORDER BY pol.qty " + self.order
        self.env.cr.execute(query_detail, tuple(domain))
        detail = self.env.cr.dictfetchall()
        # summary
        query_summary = "SELECT " + fields_summary + query + condition + " GROUP BY pg.name ORDER BY total_sale " + self.order 
        self.env.cr.execute(query_summary, tuple(domain))
        summary = self.env.cr.dictfetchall()
        return detail, summary