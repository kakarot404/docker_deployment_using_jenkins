import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})

// Class to manage DB related operations
export class DbService {
  currentRow = {
    'name': "",
    'occupation': "",
    'age': 0,
    'update': false
  }
  constructor(private httpClient: HttpClient, private cookieService: CookieService) {

  }

  // get all data [test on small number of data]
  getData() {
    return this.httpClient.get<any>('/api/data/getData', { headers: { 'Authorization': this.cookieService.get('token') } })
  }

  // update a single row
  updateRow() {
    return this.httpClient.post<any>('/api/data/updateData', this.currentRow, { headers: { 'Authorization': this.cookieService.get('token') } })
  }

  // delete a single row
  deleteRow() {
    return this.httpClient.post<any>('/api/data/deleteData', this.currentRow, { headers: { 'Authorization': this.cookieService.get('token') } })
  }

  // add a row
  addRow(rowData) {
    return this.httpClient.post<any>('/api/data/addData', rowData, { headers: { 'Authorization': this.cookieService.get('token') } })
  }

}
