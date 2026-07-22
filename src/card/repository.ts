import { CardApiEndpoint } from '#card/api-endpoint.js';
import { type CardData, CardModel } from '#card/model.js';
import { cardValidator } from '#card/validator.js';
import { AbstractRepository, type Repository } from '#core/abstract-repository.js';
import type { EndpointInterface } from '#core/endpoint-interface.js';

export class CardRepository extends AbstractRepository<CardData, CardModel> implements Repository<CardData, CardModel> {
  constructor(endpoint?: EndpointInterface<CardData>) {
    super({ endpoint: endpoint ?? new CardApiEndpoint(), validator: cardValidator, model: CardModel });
  }
}
