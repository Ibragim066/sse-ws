import createRequest from './createRequest';

export default class Entity {
  constructor(entityPath) {
    this.entityPath = entityPath;
  }

  list() {
    return createRequest({
      method: 'GET',
      path: `/${this.entityPath}`,
    });
  }

  get(id) {
    return createRequest({
      method: 'GET',
      path: `/${this.entityPath}/${id}`,
    });
  }

  create(data) {
    return createRequest({
      method: 'POST',
      path: `/${this.entityPath}`,
      data,
    });
  }

  update(id, data) {
    return createRequest({
      method: 'PUT',
      path: `/${this.entityPath}/${id}`,
      data,
    });
  }

  delete(id) {
    return createRequest({
      method: 'DELETE',
      path: `/${this.entityPath}/${id}`,
    });
  }
}
