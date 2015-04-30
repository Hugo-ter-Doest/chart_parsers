/*
    Settings module for chart parsers
    Copyright (C) 2015 Hugo W.L. ter Doest

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// If true the chart parsers apply unification in parsing
// At completion steps feature structures are unified
exports.UNIFICATION = true;

// The event function is called by Agenda and Chart when items are added
// Agenda and Chart are event emitters
exports.event_function = function(event_name, item) {
  //console.log(event_name + ': ' + item.id);
};

//exports.log4js_config = '/home/hugo/Workspace/chart-parsers/config/log4js.json';
exports.log4js_config = '/Eclipse Workspace/chart_parsers/config/log4js.json';

