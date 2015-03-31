# Logstash UDP stream for Bunyan

# Configuration options

<table>
  <tr>
    <th>level</th>
    <td>string</td>
    <td><code>info</code></td>
  </tr>
  <tr>
    <th>host</th>
    <td>string</td>
    <td><code>"127.0.0.1"</code></td>
  </tr>
  <tr>
    <th>port</th>
    <td>number</td>
    <td><code>9999</code></td>
  </tr>
  <tr>
    <th>tags</th>
    <td>array|string[]</td>
    <td><code>["bunyan"]</code></td>
  </tr>
</table>

# Adding the bunyan-hub-logstash stream to Bunyan

```
var log = bunyan.createLogger({
  streams: [
    {
      type: "raw",
      stream: require('bunyan-hub-logstash').createStream({
        host: '127.0.0.1',
        port: 5505
      })
    }
  ]
});
```
