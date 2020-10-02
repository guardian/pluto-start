import { delayedRequest } from "../app/OAuthCallbackComponent.jsx";

global.fetch = jest.fn(() => Promise.resolve("file scoped default value"));

describe("delayedRequest", () => {
  it("should cope with UserBeacon being contacted successfully", async () => {
    fetch.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          resolve({ status: 200 });
        })
    );

    const requestOutput = await delayedRequest(
      "/test/url/segment",
      200,
      "Token"
    );
    expect(fetch).toHaveBeenCalledWith("/test/url/segment", {
      headers: { Authorization: "Bearer Token", body: "" },
      method: "PUT",
    });
    expect(requestOutput).toBe();
  });

  it("should cope with UserBeacon not being contacted successfully", async () => {
    fetch.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          resolve({ status: 403 });
        })
    );

    const requestOutput = await delayedRequest(
      "/test/url/segment",
      200,
      "Token"
    );
    expect(fetch).toHaveBeenCalledWith("/test/url/segment", {
      headers: { Authorization: "Bearer Token", body: "" },
      method: "PUT",
    });
    expect(requestOutput).toBe();
  });

  it("should cope with an error attempting to contact UserBeacon", async () => {
    fetch.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          reject("Problem connecting to UserBeacon");
        })
    );

    try {
      const requestOutput = await delayedRequest(
        "/test/url/segment",
        200,
        "Token"
      );
      expect(fetch).toHaveBeenCalledWith("/test/url/segment", {
        headers: { Authorization: "Bearer Token", body: "" },
        method: "PUT",
      });
      expect(requestOutput).toBe();
    } catch (err) {}
  });

  it("should cope if no response received before time out", async () => {
    fetch.mockImplementation(() => new Promise((resolve, reject) => {}));

    const requestOutput = await delayedRequest(
      "/test/url/segment",
      2000,
      "Token"
    );
    expect(fetch).toHaveBeenCalledWith("/test/url/segment", {
      headers: { Authorization: "Bearer Token", body: "" },
      method: "PUT",
    });
    expect(requestOutput).toBe();
  });
});
