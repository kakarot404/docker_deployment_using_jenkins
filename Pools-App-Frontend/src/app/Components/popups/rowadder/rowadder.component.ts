import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-rowadder',
  templateUrl: './rowadder.component.html',
  styleUrls: ['./rowadder.component.css']
})
export class RowadderComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RowadderComponent>) { }

  ngOnInit(): void {
  }

  addClicked(action) {
    if (action == 1) {
      this.dialogRef.close({ name: (<HTMLInputElement>document.getElementById('name_i')).value, occupation: (<HTMLInputElement>document.getElementById('occ_i')).value, age: (<HTMLInputElement>document.getElementById('age_i')).value })
    }
    else {
      this.dialogRef.close([-1])
    }

  }
}
