import { delayedRequest } from "../app/login/OAuthService";

//@ts-ignore
global.fetch = jest.fn(() => Promise.resolve("file scoped default value"));

describe("delayedRequest", () => {
  it("should cope with UserBeacon being contacted successfully", async () => {
    //@ts-ignore
    fetch.mockImplementation(
      () =>
        new Promise((resolve, _) => {
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
  });

  it("should cope with UserBeacon not being contacted successfully", async () => {
    //@ts-ignore
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
  });

  it("should cope with an error attempting to contact UserBeacon", async () => {
    //@ts-ignore
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
    } catch (err) {}
    expect(fetch).toHaveBeenCalledWith("/test/url/segment", {
      headers: { Authorization: "Bearer Token", body: "" },
      method: "PUT",
    });
  });

  it("should cope if no response received before time out", async () => {
    //@ts-ignore
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
  });
});
