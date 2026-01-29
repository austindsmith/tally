import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import creds from "../tally-service-account.json";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

export async function readSheet(sheetId: string) {
  console.log(sheetId);

  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

  await doc.loadInfo();

  console.log(doc.title);

  // Add dropdown field to let user select which sheet to use

  const sheet = doc.sheetsByIndex[0];
  console.log(sheet.rowCount);

  return;
}
