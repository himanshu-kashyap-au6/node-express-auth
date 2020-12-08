const globals = {
  modelTypes: {
    user: 'users',
    employee: 'employees',
  },

  fieldArray: [
    'firstName',
    'lastName',
    'emailId',
    'organizationName',
    'publicId',
    '_id',
  ],

  sortFieldArray: ['fName', 'lName', 'email', 'orgName', 'pubId', 'mId'],

  fieldObject: {
    fName: 'firstName',
    lName: 'lastName',
    email: 'emailId',
    orgName: 'organizationName',
    pubId: 'publicId',
    mId: '_id',
  }
};

module.exports = globals;
