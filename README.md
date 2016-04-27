# Localport

Localport is a little utility to assign TCP ports based on words, and
then forward to them based on a subdomain name.

It is intended to solve the problem of having to come up with
unique-yet-somehow-memorable local ports (8000, 8080, 8888, etc) for
all your utilities and development projects running on localhost.

You start by computing a port:

```
$ localport myproject
18206
```

This will hash the word and use some of the bits of the hash to
produce a (high) port number to use.

And then set up whatever script is launching your `myproject` service
to use that port.

Next, you start the forwarding service:

```
$ localport --port 4040 &
```

Now the tricky part is to get a domain where all subdomains resolve to
localhost. If you're using
[dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html) or a similar
tool, you can use that. But even easier is just using one of the
various 'real' domain names that are set up to resolve to 127.0.0.1.
Two nice short ones are `lvh.me` and `vcap.me`.

Go to `http://myproject.lvh.me:4040`, and your request will be
forwarded to your service.

To get rid of the ugly `:4040` part, either run your proxy on port 80,
if you don't already have something running there, or configure your
webserver to forward the domain you're using to your proxy's port
(make sure you also forward the `Host` header, so that the proxy can
find out the subdomain you used). With NGINX, this worked:

```
server {
  server_name *.lvh.me;
  listen 127.0.0.1:80;

  location / {
    proxy_pass http://localhost:4040/;
	proxy_set_header Host $http_host;
  }
}
```

The `localport` command (when used in server mode), support the
following arguments:

**`--port PORT`** to set the port to listen on. Defaults to 8000.

**`--define NAME:PORT`** to explicitly set a port to forward to
(rather than using the automatic hashing) for a given name.
