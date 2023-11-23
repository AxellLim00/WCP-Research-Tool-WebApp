export class FreeCurrencyAPI {
  baseUrl = "https://api.freecurrencyapi.com/v1/";

  // temporary API_KEY using Axell's account from https://freecurrencyapi.com
  constructor(apiKey = "fca_live_9rGbrfYBHZF87MKp6NT4CdrsTChb2rPy2bdD9lfw") {
    this.headers = {
      apikey: apiKey,
    };
  }

  call(endpoint, params = {}) {
    const paramString = new URLSearchParams({
      ...params,
    }).toString();

    return fetch(`${this.baseUrl}${endpoint}?${paramString}`, {
      headers: this.headers,
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  }

  status() {
    return this.call("status");
  }

  currencies(params) {
    return this.call("currencies", params);
  }

  latest(params) {
    return this.call("latest", params);
  }

  historical(params) {
    return this.call("historical", params);
  }
}
