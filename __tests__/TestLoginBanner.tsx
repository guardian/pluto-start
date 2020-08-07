import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";
import LoginBanner from "../app/LoginBanner";
import { JwtDataShape, JwtData } from "../app/DecodedProfile";

describe("LoginBanner", () => {
  afterEach(() => {
    Object.defineProperty(window, "sessionStorage", { value: undefined });
  });

  it("should display a welcome message if there is content", (done) => {
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem(key: string) {
          switch (key) {
            case "pluto:access-token":
              return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoiamVzdC10ZXN0IiwidXNlcm5hbWUiOiJqb2huX2RvZSIsImZhbWlseV9uYW1lIjoiRG9lIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.1wuso9Nn7utj_vxF9Ycy2LRYVbfArv6DcT4fTRMfXc0";
            case "pluto:refresh-token":
              return null;
            case "adfs-test:signing-key":
              return "your-256-bit-secret";
            default:
              throw "requested unexpected key: " + key;
          }
        },
        setItem() {},
      },
    });

    const rendered = shallow(
      <LoginBanner
        clientId="sdffsfs"
        resource="fsdfdsfs"
        redirectUri="fdsfdsfds"
        oAuthUri="fdsfdsfds"
      />
    );
    setTimeout(() => {
      //have not yet found a better way to do this!
      try {
        expect(rendered.find(".welcome").text()).toContain("Welcome John Doe");
        expect(rendered.find(".username-box").text()).toContain("john_doe");
        expect(
          rendered.find(".welcome").find("p.smaller").hasClass("warning")
        ).toBeFalsy();
        done();
      } catch (err) {
        done.fail(err);
      }
    }, 500);
  });

  it("should display a warning if expiryWarning is set", (done) => {
    const nowTimeSeconds = new Date().getTime() / 1000;
    const fakeExpTime = nowTimeSeconds + 150;
    const rendered = shallow(
      <LoginBanner
        clientId="fdsfsdfsd"
        resource="fdsfds"
        redirectUri="fdsfdsfs"
        oAuthUri="fdfdsfsd"
      />
    );
    const fakeProfile = JwtData({
      exp: fakeExpTime,
      sub: "someuser",
      aud: "someapp",
    });
    rendered
      .instance()
      .setState({ expiryWarning: true, loginData: fakeProfile }, () => {
        expect(rendered.find(".welcome").text()).toContain(
          "Your login expires soon!"
        );
        expect(
          rendered.find(".welcome").find("p.smaller").hasClass("warning")
        ).toBeTruthy();
        done();
      });
  });
});

interface ExpectedState {
  expiryWarning: boolean;
  expired: boolean;
  expiredAt: number;
}
describe("LoginBanner.checkExpiryHandler", () => {
  it("should set expiryWarning if the expiry time is less than 300 seconds in the future", (done) => {
    const nowTimeSeconds = new Date().getTime() / 1000;
    const fakeExpTime = nowTimeSeconds + 150;
    const rendered = shallow(
      <LoginBanner
        clientId="sdffsfs"
        resource="fsdfdsfs"
        redirectUri="fdsfdsfds"
        oAuthUri="fdsfdsfds"
      />
    );
    rendered.instance().setState(
      {
        loginData: JwtData({
          exp: fakeExpTime,
          sub: "someuser",
          aud: "someapp",
        }),
      },
      () => {
        const completionPromise = (rendered.instance() as LoginBanner).checkExpiryHandler();

        if (completionPromise == null) {
          done.fail(
            "expiry handler did not return anything so did not set anything"
          );
        } else {
          completionPromise.then(() => {
            const renderedState = rendered.instance().state as ExpectedState;
            expect(renderedState.expiryWarning).toBeTruthy();
            expect(renderedState.expired).toBeFalsy();
            expect(renderedState.expiredAt).toEqual(null);
            done();
          });
        }
      }
    );
  });

  it("should set expired if the expiry time is in the past", (done) => {
    const nowTimeSeconds = new Date().getTime() / 1000;
    const fakeExpTime = nowTimeSeconds - 150;
    const rendered = shallow(
      <LoginBanner
        clientId="sdffsfs"
        resource="fsdfdsfs"
        redirectUri="fdsfdsfds"
        oAuthUri="fdsfdsfds"
      />
    );
    rendered.instance().setState(
      {
        loginData: JwtData({
          exp: fakeExpTime,
          sub: "someuser",
          aud: "someapp",
        }),
      },
      () => {
        const completionPromise = (rendered.instance() as LoginBanner).checkExpiryHandler();

        if (completionPromise == null) {
          done.fail(
            "expiry handler did not return anything so did not set anything"
          );
        } else {
          completionPromise.then(() => {
            const renderedState = rendered.instance().state as ExpectedState;
            expect(renderedState.expiryWarning).toBeFalsy();
            expect(renderedState.expired).toBeTruthy();
            expect(renderedState.expiredAt).toEqual(fakeExpTime);
            done();
          });
        }
      }
    );
  });

  it("should set nothing if expiry time is more than 5 minutes in the future", (done) => {
    const nowTimeSeconds = new Date().getTime() / 1000;
    const fakeExpTime = nowTimeSeconds + 500;
    const rendered = shallow(
      <LoginBanner
        clientId="sdffsfs"
        resource="fsdfdsfs"
        redirectUri="fdsfdsfds"
        oAuthUri="fdsfdsfds"
      />
    );
    rendered.instance().setState(
      {
        loginData: JwtData({
          exp: fakeExpTime,
          sub: "someuser",
          aud: "someapp",
        }),
      },
      () => {
        const completionPromise = (rendered.instance() as LoginBanner).checkExpiryHandler();

        if (completionPromise == null) {
          done();
        } else {
          completionPromise.then(() => {
            done.fail(
              "returned a promise so presumably set something when it shouldn't"
            );
          });
        }
      }
    );
  });
});

describe("LoginBanner.makeLoginUrl", () => {
  it("should build a URL with the props as query string content", () => {
    const rendered = shallow(
      <LoginBanner
        clientId="some-client-id"
        resource="some-resource"
        redirectUri="https://my-redirect-uri"
        oAuthUri="https://oauthIdP.int/adfs/oauth2/authorize"
      />
    );
    const loginBanner = rendered.instance() as LoginBanner;

    const result = loginBanner.makeLoginUrl();
    expect(result).toEqual(
      "https://oauthIdP.int/adfs/oauth2/authorize?response_type=code&client_id=some-client-id&resource=some-resource&redirect_uri=https%3A%2F%2Fmy-redirect-uri&state=%2F"
    );
  });
});
