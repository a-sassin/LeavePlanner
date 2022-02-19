import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  encryptSecretKey = 'Leave_planner_encryption_key';

  encryptPassword(pass: string): any {
    return CryptoJS.AES.encrypt(pass, this.encryptSecretKey).toString();
  }
}
