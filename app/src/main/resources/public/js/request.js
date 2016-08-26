/*
 * #%L
 * Telsigne
 * %%
 * Copyright (C) 2016 Orange
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * #L%
 */
console.log("Cool, request.js is loaded :)");

var $form = $('#requestInfo');
var requestSpan = document.getElementById('requestSpan');
$form.on('submit', function(event) {
     var requestName = {
       requestName: $('#requestName').val()
     };
    event.preventDefault();
    $.ajax({
       url: $form.attr('action'),
       type: 'post',
       data: JSON.stringify(requestName),
       contentType: "application/json",
       success: function(response) {
           var url = "/sec/request/";
           window.location = url;
           requestSpan.style.visibility="hidden";
       },
       error: function(response) {
           requestSpan.style.visibility="visible";
       }
})});

$form.on('input', function(event) {
    document.getElementById('requestSpan').style.visibility="hidden";
});

var $new_request = $('#new_request');
$new_request.on('hidden.bs.modal', function() {
    if ($('#requestInfo').find('#requestSpan').length) {
        requestSpan.style.visibility="hidden";
        $('#requestName').val("");
    }
});