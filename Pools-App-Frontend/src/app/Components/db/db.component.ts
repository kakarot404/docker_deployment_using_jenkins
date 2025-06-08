import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DbService } from 'src/app/Services/db.service';
import { MatDialog } from '@angular/material/dialog';
import { RowadderComponent } from 'src/app/Components/popups/rowadder/rowadder.component';
import { StatusMessageService } from 'src/app/Services/status-message.service';
import { ManageService } from 'src/app/Services/manage.service';

const USER_SCHEMA = {
  "name": "text",
  "occupation": "text",
  "age": "number",
}

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.css']
})
export class DBComponent implements OnInit {

  displayedColumns: string[] = ['name', 'occupation', 'age', '$$edit'];
  dbContent = [];
  dataSchema = USER_SCHEMA;
  currentRow = {
    name: "",
    occupation: "",
    age: 0,
    isEdit: false
  }

  constructor(private dbService: DbService, public rowDialog: MatDialog, private statusMessage: StatusMessageService, public manageService: ManageService, private changeDetectionRef: ChangeDetectorRef) {
    this.refreshTable()
  }
  refreshTable() {
    this.dbService.getData().subscribe((response) => {
      if (response.status == 200) {
        response.dbContent.forEach((x) => { x['isEdit'] = false })
        this.dbContent = response.dbContent
        this.changeDetectionRef.detectChanges()
      }
      else {
        this.dbContent = []
      }

    }, (err) => {
      this.statusMessage.displayStatus(err.status + " : " + err.statusText, 0)
      this.dbContent = []
    })
  }
  editClicked(rowData) {
    this.currentRow = rowData;
    this.dbService.currentRow = {
      'name': rowData['name'],
      'age': rowData['age'],
      'occupation': rowData['occupation'],
      'update': false
    }
  }
  dataChanged(event) {
    this.dbService.currentRow[event.target.nextSibling.textContent] = event.target.value
    this.dbService.currentRow['update'] = true
  }

  updateRow() {
    console.log(this.dbContent[this.dbContent.findIndex(x => x.name == this.dbService.currentRow.name)])
    if (this.dbService.currentRow.update) {
      if (this.dbService.currentRow.age == 0) {
        this.dbService.deleteRow().subscribe((response) => {
          this.refreshTable()
          this.statusMessage.displayStatus(response.message, 1)
        }, err => {
          this.statusMessage.displayStatus("Something went wrong", 0)
        })
      }
      else {
        this.dbService.updateRow().subscribe((response) => {
          this.refreshTable()
          this.statusMessage.displayStatus(response.message, 1)
        }, err => {
          this.statusMessage.displayStatus(err.message, 0)
          console.log(err)
        })
      }
    }
    else { }
    this.dbService.currentRow = {
      name: "",
      occupation: "",
      age: 0,
      update: false
    }
  }

  openRowAdder() {
    this.rowDialog.open(RowadderComponent).afterClosed().subscribe(actionResult => {
      if (actionResult[0] != -1) {
        this.dbService.addRow({ name: actionResult.name, occupation: actionResult.occupation, age: actionResult.age }).subscribe(actionStatus => {
          if (actionStatus.status == 200) {
            this.dbService.getData().subscribe((response,) => {
              if (response.status == 200) {
                response.dbContent.forEach((x) => { x['isEdit'] = false })
                this.dbContent = response.dbContent
                this.statusMessage.displayStatus("Row Inserted Successfully!!!", 1)
              }
              else {
                this.statusMessage.displayStatus("Something Went Wrong!!!", 0)
              }

            }, (error) => {
              this.statusMessage.displayStatus("Something Went Wrong!!!", 0)
            })
          }
          else {
            this.statusMessage.displayStatus("Something Went Wrong!!!", 0)
          }
        })
      }
    });
  }

  ngOnInit(): void {
  }

}

