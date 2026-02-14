export enum LoginStatus {
    Initiaize = -1,
    Success = 0,
    BadPassword = 1,
    InvalidUser = 2,
    TwoFactorRequired = 3,
    Exception = 4,
    ChallengeRequired = 5,
    LimitError = 6,
    InactiveUser = 7,
    CheckpointLoggedOut = 8,
    InvalidCredentials = 9,
    OnTest = 100
}
