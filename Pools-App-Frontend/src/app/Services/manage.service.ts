import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

// Class to manage the management configuration
export class ManageService {
  dbEnabled = false
  authEnabled = false
  constructor(private httpClient: HttpClient) {
    this.getConfig().subscribe((response) => {
      if (response.status == 200) {
        this.dbEnabled = response.dbEnabled
        this.authEnabled = response.authEnabled
      }
    })

  }

  // get current config
  getConfig() {
    return this.httpClient.get<any>('/api/manage/getConfig')
  }

  // set current config
  upateConfig(configData) {
    return this.httpClient.post<any>('/api/manage/updateConfig', configData)
  }
}
