const original = Symbol("original");

function Collection(config) {
  Object.assign(this, config);

  this[original] = Object.assign({}, this);
}

Collection.url = 'http://jsonplaceholder.typicode.com/todos';

Collection.list = function () {
  return fetch(this.url)
    .then(response => response.json())
    .then(json => json.map(item => new Collection(item)));
};

Collection.get = function (id) {
  return fetch(`${this.url}/${id}`)
    .then(response => response.json())
    .then(json => new Collection(json));
};

Collection.prototype.save = function () {
  if (this.id) {
    const diff = Object.keys(this)
      .filter(key => this[original][key] !== this[key])
      .reduce((acc, key) => {
        const result = acc;
        result[key] = this[key];
        return result;
      }, {});

    return fetch(`${this._url}/${this.id}`, {
      method: 'PATCH',
      body: JSON.stringify(diff),
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    const props = Object.assign({}, this);
    return fetch(this._url, {
      method: 'POST',
      body: JSON.stringify(props),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        this[original] = props;
        return response;
      });
  }
};


function Photo(config) {
  Collection.call(this, config);
}
Photo.url = 'http://jsonplaceholder.typicode.com/photos';
Photo.prototype = Object.create(Collection.prototype);

Photo.list = function () {
  return Collection.list.call(Photo)
    .then(items => items.map(item => new Photo(item)));
};

Photo.get = function () {
  return Collection.get.call(Photo)
    .then(collection => new Photo(collection));
};


function Album(config) {
  Collection.call(this, config);
}
Album.url = 'http://jsonplaceholder.typicode.com/albums';
Album.prototype = Object.create(Collection.prototype);

Album.list = function () {
  return Collection.list.call(Album)
    .then(items => items.map(item => new Album(item)));
};

Album.get = function () {
  return Collection.get.call(Album)
    .then(collection => new Album(collection));
};

Album.prototype.save = function () {
  const valid = () => 'userId' in this && 'title' in this;
  if (!valid()) throw new Error('User data is not correct');

  return Collection.prototype.save.call(this);
};

Album.prototype.getPhotos = function () {
  return fetch(`${Photo.url}?albumId=${this.id}`)
    .then(response => response.json())
    .then(json => json.map(item => new Photo(item)));
};


function User(config) {
  Collection.call(this, config);
}
User.url = 'http://jsonplaceholder.typicode.com/users';
User.prototype = Object.create(Collection.prototype);

User.list = function () {
  return Collection.list.call(User)
    .then(items => items.map(item => new User(item)));
};

User.get = function () {
  return Collection.get.call(User)
    .then(collection => new User(collection));
};

User.prototype.save = function () {
  const valid = () => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return 'name' in this && 'username' in this && 'email' in this && re.test(this.email);
  };

  if (!valid()) throw new Error('User data is not correct');

  return Collection.prototype.save.call(this);
};

User.prototype.getAlbums = function () {
  return fetch(`${Album.url}?userId=${this.id}`)
    .then(response => response.json())
    .then(json => json.map(item => new Album(item)));
};
