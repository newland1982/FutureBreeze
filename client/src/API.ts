/* tslint:disable */
//  This file was automatically generated and should not be edited.

export type CreateUserInfoInput = {
  id?: string | null,
  idName?: string | null,
  aliasName: string,
  ipAddress?: string | null,
  password?: string | null,
  smFileUploadCount?: number | null,
  mdFileUploadCount?: number | null,
  lgFileUploadCount?: number | null,
  isInvalid?: boolean | null,
};

export type UpdateUserInfoInput = {
  id: string,
  idName?: string | null,
  aliasName?: string | null,
  ipAddress?: string | null,
  password?: string | null,
  smFileUploadCount?: number | null,
  mdFileUploadCount?: number | null,
  lgFileUploadCount?: number | null,
  isInvalid?: boolean | null,
};

export type DeleteUserInfoInput = {
  id?: string | null,
};

export type ModelUserInfoFilterInput = {
  id?: ModelIDFilterInput | null,
  idName?: ModelStringFilterInput | null,
  aliasName?: ModelStringFilterInput | null,
  ipAddress?: ModelStringFilterInput | null,
  password?: ModelStringFilterInput | null,
  smFileUploadCount?: ModelIntFilterInput | null,
  mdFileUploadCount?: ModelIntFilterInput | null,
  lgFileUploadCount?: ModelIntFilterInput | null,
  isInvalid?: ModelBooleanFilterInput | null,
  and?: Array< ModelUserInfoFilterInput | null > | null,
  or?: Array< ModelUserInfoFilterInput | null > | null,
  not?: ModelUserInfoFilterInput | null,
};

export type ModelIDFilterInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type ModelStringFilterInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type ModelIntFilterInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  contains?: number | null,
  notContains?: number | null,
  between?: Array< number | null > | null,
};

export type ModelBooleanFilterInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type CreateUserInfoMutationVariables = {
  input: CreateUserInfoInput,
};

export type CreateUserInfoMutation = {
  createUserInfo:  {
    __typename: "UserInfo",
    id: string,
    idName: string | null,
    aliasName: string,
    ipAddress: string | null,
    password: string | null,
    smFileUploadCount: number | null,
    mdFileUploadCount: number | null,
    lgFileUploadCount: number | null,
    isInvalid: boolean | null,
  } | null,
};

export type UpdateUserInfoMutationVariables = {
  input: UpdateUserInfoInput,
};

export type UpdateUserInfoMutation = {
  updateUserInfo:  {
    __typename: "UserInfo",
    id: string,
    idName: string | null,
    aliasName: string,
    ipAddress: string | null,
    password: string | null,
    smFileUploadCount: number | null,
    mdFileUploadCount: number | null,
    lgFileUploadCount: number | null,
    isInvalid: boolean | null,
  } | null,
};

export type DeleteUserInfoMutationVariables = {
  input: DeleteUserInfoInput,
};

export type DeleteUserInfoMutation = {
  deleteUserInfo:  {
    __typename: "UserInfo",
    id: string,
    idName: string | null,
    aliasName: string,
    ipAddress: string | null,
    password: string | null,
    smFileUploadCount: number | null,
    mdFileUploadCount: number | null,
    lgFileUploadCount: number | null,
    isInvalid: boolean | null,
  } | null,
};

export type GetUserInfoQueryVariables = {
  id: string,
};

export type GetUserInfoQuery = {
  getUserInfo:  {
    __typename: "UserInfo",
    id: string,
    idName: string | null,
    aliasName: string,
    ipAddress: string | null,
    password: string | null,
    smFileUploadCount: number | null,
    mdFileUploadCount: number | null,
    lgFileUploadCount: number | null,
    isInvalid: boolean | null,
  } | null,
};

export type ListUserInfosQueryVariables = {
  filter?: ModelUserInfoFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserInfosQuery = {
  listUserInfos:  {
    __typename: "ModelUserInfoConnection",
    items:  Array< {
      __typename: "UserInfo",
      id: string,
      idName: string | null,
      aliasName: string,
      ipAddress: string | null,
      password: string | null,
      smFileUploadCount: number | null,
      mdFileUploadCount: number | null,
      lgFileUploadCount: number | null,
      isInvalid: boolean | null,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type OnCreateUserInfoSubscription = {
  onCreateUserInfo:  {
    __typename: "UserInfo",
    id: string,
    idName: string | null,
    aliasName: string,
    ipAddress: string | null,
    password: string | null,
    smFileUploadCount: number | null,
    mdFileUploadCount: number | null,
    lgFileUploadCount: number | null,
    isInvalid: boolean | null,
  } | null,
};

export type OnUpdateUserInfoSubscription = {
  onUpdateUserInfo:  {
    __typename: "UserInfo",
    id: string,
    idName: string | null,
    aliasName: string,
    ipAddress: string | null,
    password: string | null,
    smFileUploadCount: number | null,
    mdFileUploadCount: number | null,
    lgFileUploadCount: number | null,
    isInvalid: boolean | null,
  } | null,
};

export type OnDeleteUserInfoSubscription = {
  onDeleteUserInfo:  {
    __typename: "UserInfo",
    id: string,
    idName: string | null,
    aliasName: string,
    ipAddress: string | null,
    password: string | null,
    smFileUploadCount: number | null,
    mdFileUploadCount: number | null,
    lgFileUploadCount: number | null,
    isInvalid: boolean | null,
  } | null,
};
