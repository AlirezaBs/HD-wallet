export class WorkerLockedError extends Error {
  constructor(message = "Wallet is locked") {
    super(message);
    this.name = "WorkerLockedError";
  }
}

export class WrongPasswordError extends Error {
  constructor(message = "Wrong password") {
    super(message);
    this.name = "WrongPasswordError";
  }
}

export class VaultExistsError extends Error {
  constructor(message = "Vault already exists") {
    super(message);
    this.name = "VaultExistsError";
  }
}

export class InvalidMnemonicError extends Error {
  constructor(message = "Invalid mnemonic phrase") {
    super(message);
    this.name = "InvalidMnemonicError";
  }
}

export class InvalidAccountLabelError extends Error {
  constructor(message = "Invalid account label") {
    super(message);
    this.name = "InvalidAccountLabelError";
  }
}

export class InvalidAccountIndexError extends Error {
  constructor(message = "Invalid account index") {
    super(message);
    this.name = "InvalidAccountIndexError";
  }
}

export class CannotRemoveAccountError extends Error {
  constructor(message = "Cannot remove the only account") {
    super(message);
    this.name = "CannotRemoveAccountError";
  }
}

export class SolanaSignerNotRequiredError extends Error {
  constructor(
    message = "Derived account is not a required signer for this transaction",
  ) {
    super(message);
    this.name = "SolanaSignerNotRequiredError";
  }
}

export class SolanaSignerMismatchError extends Error {
  constructor(message = "Derived account does not match the expected signer") {
    super(message);
    this.name = "SolanaSignerMismatchError";
  }
}

export class InvalidSolanaMessageError extends Error {
  constructor(message = "Invalid Solana transaction message") {
    super(message);
    this.name = "InvalidSolanaMessageError";
  }
}

export class InvalidSolanaSignatureError extends Error {
  constructor(message = "Invalid Solana signature length") {
    super(message);
    this.name = "InvalidSolanaSignatureError";
  }
}

export class SolanaConfirmationFailedError extends Error {
  constructor(message = "Solana transaction confirmation failed") {
    super(message);
    this.name = "SolanaConfirmationFailedError";
  }
}

export class SolanaBlockhashExpiredError extends Error {
  constructor(
    message = "Transaction expired. Go back, rebuild the transaction, review it, and sign again.",
  ) {
    super(message);
    this.name = "SolanaBlockhashExpiredError";
  }
}
