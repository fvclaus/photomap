create table users(id integer primary key, login text not null, password text not null);
create table albums(id integer primary key autoincrement, name text not null, desc text);
create table permissons(user integer references users(id) on delete cascade not null, album integer references album(id) on delete cascade not null);
create table places(id integer primary key autoincrement, album integer references albums(id) on delete cascade, name text not null, desc text, lat real not null, lng real not null);
create table photos(id integer primary key autoincrement, place integer references places(id) on delete cascade, source text not null, thumb text not null, name text not null, desc text,"order" integer);
insert into users(login,password) values('admin','000');
insert into users(login,password) values('guest','Moh8ai3');
