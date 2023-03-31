using {wilye} from '../db/data-model';

service CatalogService @(path: '/CatalogService') {
    entity customer as projection on wilye.customer;

    action getCustomerByCountry() returns array of {
        _id : String;
        count : Integer64;
    }
}
