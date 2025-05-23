# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ProjectProject(models.Model):
    _inherit = "project.project"

    type_id = fields.Many2one(
        comodel_name="project.type",
        string="Type",
        copy=True,
        domain="[('project_ok', '=', True)]",
    )
