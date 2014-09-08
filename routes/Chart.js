/*
    Generic chart that can be used for all chart parsers (hopefully)
    Copyright (C) 2014 Hugo W.L. ter Doest

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

// Implements a chart with from/to edges. Items are added by chart.add_item(i, j, item)
// Items are identified by their id. Items that have the same id are not added to the samen edge.

function Chart(N) {
  this.outgoing_edges = new Array(N);
  this.incoming_edges = new Array(N);
}

Chart.prototype.add_item = function(i, j, item) {
  if (!this.outgoing_edges[i]) {
    this.outgoing_edges[i] = {};
  }
  this.outgoing_edges[i][item.id] = item;
  if (!this.incoming_edges[i]) {
    this.incoming_edges[i] = {};
  }
  this.incoming_edges[j][item.id] = item;
};

Chart.prototype.get_items_from_to = function(i, j) {
  var res = [];
  var that = this;
  this.outgoing_edges[i].forEach(function(item_id){
    if (that.outgoing_edges[i][item_id].data.to === j) {
      res.push(that.outgoing_edges[i][item_id]);
    }
  });
  return(res);
};

Chart.prototype.get_items_from = function(i) {
  var res = [];
  var that = this;
  this.outgoing_edges[i].forEach(function(item_id){
    res.push(that.outgoing_edges[i][item_id]);
  });
  return(res);
};

Chart.prototype.get_items_to = function(j) {
  var res = [];
  var that = this;
  this.incoming_edges[i].forEach(function(item_id){
    res.push(that.incoming_edges[i][item_id]);
  });
  return(res);
};

module.exports = Chart;