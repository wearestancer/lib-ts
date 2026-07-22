# Stancer TypeScript library

## Requirement:

[Stancer account](https://signup.stancer.com/en/sign-up)

Node: 22 or above

## Setup

To use our SDK you will need to have API Keys.

### Live

Add your key in a secure environment.
set key in the configuration object:

```ts
Configuration.setKeys({
  privateLiveKey: process.env['API_PROD_KEY'],
  privateTestKey: process.env['API_TEST_KEY'],
});
```

Never put your key directly in your code.

### Test

To test our sdk add your test key as an environment variable:

```shell
API_KEY="stest_..." npm test
```

The functional test get will not pass as it is linked to specific object in the API.

## General Concept

## Repository Concept

To create, get, update, delete or list stancer object you will use Repositories.

```ts
const repository = new Repository();
```

### Create

- Create an empty object

```ts
const stancerObject = await repository.create();
```

- Create an object with populated data

```ts
const stancerObject = await repository.create({ foo: 'foo' });
```

- Get an object from the api

```ts
const id = IdObject('obj_...');
const stancerObjectInOurAPI = await repository.create(id);
```

### Delete

Not all the object are deletable.

- Delete an object

```ts
const deletedObject = await repository.delete(stancerObject);
```

### Send

Not all object are sendable.

Our SDK will call patch if we already have an ID.
It will call post if we don't have one (Object not yet in our API).

- patch

```ts
const patchObject = await repository.send(stancerObjectInOurAPI);
```

- post

```ts
const postObject = await repository.send(stancerObjectNotInOurAPI);
```

You cannot send object if you have not modified it. It will result in an error.

### List

List the object in our API.

This will return a generator.

```ts
const objectList = await repository.list();
```

## Model Concept

You will manipulate models to get data on a specific object and modify their data.

Getter and setters are set in a way that let you easily access data that can be modified and data that can be read.

All the data modifiable are not necessarily readable.
All the data readable are not necessarily modifiable.

### Example

```ts
const cardRepository = new CardRepository();
const card = await cardRepository.create();
// you can set Number and CVC
card.setNumber('4242424242424242').setCvc('123');
// But you cannot get Number and cvc

// you can get last4
card.last4;
// but you cannot set last4
```

## Create and process a Payment Intent

While you can process payment with a payment route we encourage you to use the payment intent route as it facilitate the handling of failed payments (retry).

You have two choice when you process Payment Intent either capture it automatically or capture it manually.

### Automatic capture

```ts
//amount and currency come from your context
const paymentIntentRepository = new PaymentIntentRepository();
const paymentIntent = new paymentIntentRepository.create({ amount, currency });
paymentIntentRepository.send(paymentIntent);
const paymentPageUrl = paymentIntent.url; //embed or redirect to this url to process the payment
```

### Manual capture

```ts
//amount and currency come from your context
const paymentIntentRepository = new PaymentIntentRepository();
const returnUrl = 'mySite.example.com/handlePayments';
const paymentIntent = paymentIntentRepository.create({ amount, currency, capture: false, returnUrl });
paymentIntentRepository.send(paymentIntent);
const paymentPageUrl = paymentIntent.url; //embed or redirect to this url to process the payment
```

Then when the payment is process in the payment page the client will be redirect to `returnUrl` from here:

```ts
// Id come from the payload of the returnUrl
const paymentIntentRepository = new PaymentIntentRepository();
const paymentIntent = paymentIntentRepository.create(id);
// Here you can include business logic like update the order etc...
paymentIntentRepository.capture(paymentIntent);
```
