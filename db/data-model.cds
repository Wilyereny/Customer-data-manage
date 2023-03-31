using {
        cuid,
        managed,
        temporal,
        Currency
} from '@sap/cds/common';

// cuid can be used to generate an ID from system
namespace wilye;

entity customer : managed {
        key id          : String;
            name        : String(256);
            type        : String(2);
            emailId     : String(105);
            address     : String(32);
            companyName : String(256);
            country     : String(128);
}
