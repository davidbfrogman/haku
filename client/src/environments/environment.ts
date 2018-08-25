// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  IdentityAPIBase: 'https://dev.identity.leblum.io/api',
  V1: '/v1',
  ProductAPIBase: 'https://dev.product.leblum.io/api',
  WooConsumerKey: 'ck_d98c021485c82e711c53420f72d34e602ae1ad1b',
  WooConsumerSecret: 'cs_37d8a7cb7e932c5303a2dae67ed17cad4e620f3e',
  // curl https://leblum.com/wp-json/wc/v2/orders -u ck_d98c021485c82e711c53420f72d34e602ae1ad1b:cs_37d8a7cb7e932c5303a2dae67ed17cad4e620f3e
  // get all ->  curl -u leblum:leblum99 "https://staging.leblum.com/wp-json/wc/v2/orders?consumer_key=ck_d98c021485c82e711c53420f72d34e602ae1ad1b&consumer_secret=cs_37d8a7cb7e932c5303a2dae67ed17cad4e620f3e"
  // get single -> curl -u leblum:leblum99 "https://staging.leblum.com/wp-json/wc/v2/orders/2280?consumer_key=ck_d98c021485c82e711c53420f72d34e602ae1ad1b&consumer_secret=cs_37d8a7cb7e932c5303a2dae67ed17cad4e620f3e"
  WooApiLocation: 'https://staging.leblum.com/wp-json/wc/v2',
  WooStagingUser: 'leblum',
  WooStagingPass: 'leblum99'
};
