import HALResource from '../../services/HALResource';
export default class ListService {

    /*@ngInject*/
    constructor($resource, $filter, $q, $rootScope) {

        this.$q = $q;
        this.$filter = $filter;
        this.$rootScope = $rootScope;
        this.lists = [];

        this._initResources($resource);
    }

    getAll() {
        if (!this.lists.fetching && !this.lists.fetched) {
            this.fetch();
        }
        return this.lists;
    }

    get(listId) {
        const existingList = this._findExistingList(listId);

        if(!existingList) {
            return this.getUpdated({entityId:listId});
        }

        if(!existingList.updated) {
            return this.getUpdated(existingList);
        }

        return this._getResolvedPromise(existingList);
    }

    getUpdated(list) {
        return this.listsResource.get({id: list.entityId}).$promise
            .then((response) => {
                const responseEntity = ListService._toEntity(response);
                this._replaceExistingList(responseEntity);
                list.updated = true;
                responseEntity.updated = true;
                return responseEntity;
            });
    }

    create(list) {
        return this.listsResource.save(ListService._toResource(list)).$promise
            .then((response) => {
                const responseEntity = ListService._toEntity(response);
                this.lists.push(responseEntity);
                return responseEntity;
            });
    }

    update(list) {
        return this.listsResource.update({id: list.entityId}, ListService._toResource(list)).$promise
            .then((response) => {
                const responseEntity = ListService._toEntity(response);
                this._replaceExistingList(responseEntity);
                return responseEntity;
            });
    }

    fetch() {
        if (this.$rootScope.authenticated) {
            this.lists.fetching = true;
            this.lists.fetched = false;
            this.lists.promise = this.listsNameOnlyResource.get().$promise
                .then((response) => {
                    let entities = ListService._toEntities(HALResource.getContent(response));
                    this.lists.splice(0, this.lists.length);
                    this.lists.push.apply(this.lists, entities);
                    this.lists.fetching = false;
                    this.lists.fetched = true;
                    return entities;
                });
        } else {
            this.lists.promise = this._getRejectedPromise('Not authenticated');
        }

        return this.lists.promise;
    }

    delete(list) {
        return this.listsResource.delete({id: list.entityId}).$promise
            .then(() => {
                let existingList = this._findExistingList(list.entityId);
                if(existingList) {
                    let index = this.lists.indexOf(existingList);
                    this.lists.splice(index, 1);
                    return index;
                }
            });
    }

    deleteAll() {
        return this.listsResource.delete().$promise
            .then(() => {
                this.lists.splice(0, this.lists.length);
                return this.lists;
            });
    }

    static getDeleteMessage(list) {
        if (list && list.owners && list.owners.length > 1) {
            return 'Die Liste wäre nur für dich nicht mehr verfügbar. Solltest du sie zurück wollen, ' +
                'müsstest du dich an die restlichen Nutzer der Liste wenden.';
        } else {
            return 'Die Liste kann nicht wiederhergestellt werden.';
        }
    }

    static _toResource(entity) {
        const resource = {};
        resource._links = entity._links;
        resource.entityId = entity.entityId;
        resource.name = entity.name;
        resource.owners = [];
        resource.items = [];

        if (entity.owners) {
            for (let i = 0; i < entity.owners.length; i++) {
                resource.owners.push({username: entity.owners[i].username});
            }
        }

        if (entity.items) {
            for (let i = 0; i < entity.items.length; i++) {
                resource.items.push({entityId: entity.items[i].entityId});
            }
        }

        return resource;
    }

    static _toEntity(resource) {
        let entity = {};
        entity.entityId = resource.entityId;
        entity._links = resource._links;
        entity.name = resource.name;
        entity.owners = resource.owners ? resource.owners : [];
        entity.items = resource.items ? resource.items : [];

        return entity;
    }

    static _toEntities(resources) {

        let entities = [];
        if (!resources || !resources.length) {
            return entities;
        }

        for (let i = 0; i < resources.length; i++) {
            let entity = ListService._toEntity(resources[i]);
            entities.push(entity);
        }

        return entities;
    }

    _replaceExistingList(list) {
        const existingList = this._findExistingList(list.entityId);
        let index = this.lists.indexOf(existingList);

        if(index >= 0) {
            this.lists.splice(index, 1, list);
        }
    }

    _getRejectedPromise(message) {
        const deferred = this.$q.defer();
        const rejectedPromise = deferred.promise;
        deferred.reject(message);

        return rejectedPromise;
    }

    _getResolvedPromise(resolvedData) {

        const deferred = this.$q.defer();
        const resolvedPromise = deferred.promise;
        deferred.reject(resolvedData);

        return resolvedPromise;
    }

    _initResources($resource) {
        let methods = {
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        };
        this.listsResource = $resource('/shoppingLists/:id', null, methods);
        this.listsNameOnlyResource = $resource('shoppingLists/projections/name_only');
    }

    _findExistingList(listId) {
        return this.$filter('filter')(this.lists, {entityId: listId})[0];
    }
}