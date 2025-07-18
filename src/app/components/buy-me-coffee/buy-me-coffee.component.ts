import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface BankInfo {
  code: string;
  name: string;
  accountNumber: string;
  displayName: string;
  url: string;
}

@Component({
  selector: 'app-buy-me-coffee',
  templateUrl: './buy-me-coffee.component.html',
  styleUrls: ['./buy-me-coffee.component.scss']
})
export class BuyMeCoffeeComponent implements OnInit {
  donationForm = new FormGroup({
    amount: new FormControl('', [Validators.required, Validators.min(1000)]),
    bankCode: new FormControl('TCB', [Validators.required])
  });

  qrCodeUrl: string = '';
  isGenerating: boolean = false;
  showCoffeeAnimation: boolean = false;

  readonly banks: BankInfo[] = [
    {
      code: 'TCB',
      url: 'techlogo.png',
      name: 'Techcombank',
      accountNumber: '77979668888',
      displayName: 'HUYNH NGOC HAI'
    },
    {
      code: 'MB',
      url: 'mblogo.png',
      name: 'MB Bank',
      accountNumber: '0696961698888',
      displayName: 'HUYNH NGOC HAI'
    }
  ];

  readonly transferDescription = 'Ung ho buy me a coffee';

  constructor() {}

  ngOnInit() {
    // Start coffee animation on load
    setTimeout(() => {
      this.showCoffeeAnimation = true;
    }, 500);
  }

  get selectedBank(): BankInfo {
    return this.banks.find(bank => bank.code === this.donationForm.get('bankCode')?.value) || this.banks[0];
  }

  generateQRCode() {
    if (this.donationForm.invalid) return;
    
    this.isGenerating = true;
    const amount = this.donationForm.get('amount')?.value;
    const bank = this.selectedBank;
    
    // Generate VietQR URL
    this.qrCodeUrl = `https://img.vietqr.io/image/${bank.code}-${bank.accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(this.transferDescription)}&accountName=${encodeURIComponent(bank.displayName)}`;
    
    this.isGenerating = false;
  }
}
