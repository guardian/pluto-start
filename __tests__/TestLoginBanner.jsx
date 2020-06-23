import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";
import LoginBanner from "../app/LoginBanner";
import DecodedProfile from "../app/DecodedProfile";

describe("LoginBanner", () => {
  afterEach(() => {
    Object.defineProperty(window, "sessionStorage", { value: undefined });
  });

  it("should display a welcome message if there is content", (done) => {
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem(key) {
          switch (key) {
            case "adfs-test:token":
              return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoiamVzdC10ZXN0IiwidXNlcm5hbWUiOiJqb2huX2RvZSIsImZhbWlseV9uYW1lIjoiRG9lIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.1wuso9Nn7utj_vxF9Ycy2LRYVbfArv6DcT4fTRMfXc0";
            case "adfs-test:refresh":
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
    const fakeProfile = new DecodedProfile({
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
    rendered
      .instance()
      .setStatePromise({
        loginData: new DecodedProfile({
          exp: fakeExpTime,
          sub: "someuser",
          aud: "someapp",
        }),
      })
      .then(() => {
        const completionPromise = rendered.instance().checkExpiryHandler();

        if (completionPromise == null) {
          done.fail(
            "expiry handler did not return anything so did not set anything"
          );
        } else {
          completionPromise.then(() => {
            expect(rendered.instance().state.expiryWarning).toBeTruthy();
            expect(rendered.instance().state.expired).toBeFalsy();
            expect(rendered.instance().state.expiredAt).toEqual(null);
            done();
          });
        }
      });
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
    rendered
      .instance()
      .setStatePromise({
        loginData: new DecodedProfile({
          exp: fakeExpTime,
          sub: "someuser",
          aud: "someapp",
        }),
      })
      .then(() => {
        const completionPromise = rendered.instance().checkExpiryHandler();

        if (completionPromise == null) {
          done.fail(
            "expiry handler did not return anything so did not set anything"
          );
        } else {
          completionPromise.then(() => {
            expect(rendered.instance().state.expiryWarning).toBeFalsy();
            expect(rendered.instance().state.expired).toBeTruthy();
            expect(rendered.instance().state.expiredAt).toEqual(fakeExpTime);
            done();
          });
        }
      });
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
    rendered
      .instance()
      .setStatePromise({
        loginData: new DecodedProfile({
          exp: fakeExpTime,
          sub: "someuser",
          aud: "someapp",
        }),
      })
      .then(() => {
        const completionPromise = rendered.instance().checkExpiryHandler();

        if (completionPromise == null) {
          done();
        } else {
          completionPromise.then(() => {
            done.fail(
              "returned a promise so presumably set something when it shouldn't"
            );
          });
        }
      });
  });
});
