// common
export enum APICommonCode {
  BadRequest = 400,
}

// login
export enum APILoginCode {
  LoinAuth = 1,
}

// mfa
export enum APIMFACode {
  InvalidCode = 1,
  Expired,
}

// code_gen
export enum APISessionCheckCode {
  LoginRequired = 1,
}
