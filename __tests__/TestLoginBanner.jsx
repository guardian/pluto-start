import React from "react";
import {shallow, mount} from "enzyme";
import sinon from "sinon";
import LoginBanner from "../app/LoginBanner";

describe("LoginBanner", ()=>{
    afterEach(()=>{
        Object.defineProperty(window,"sessionStorage",{value: undefined});
    });

    it("should display a welcome message if there is content", (done)=>{
        Object.defineProperty(window,"sessionStorage",{value: {
            getItem(key){
                switch(key){
                    case "adfs-test:token":
                        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoiamVzdC10ZXN0IiwidXNlcm5hbWUiOiJqb2huX2RvZSIsImZhbWlseV9uYW1lIjoiRG9lIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.1wuso9Nn7utj_vxF9Ycy2LRYVbfArv6DcT4fTRMfXc0"
                    case "adfs-test:signing-key":
                        return "your-256-bit-secret";
                    default:
                        throw "requested unexpected key: " + key;
                }
            },
            setItem() {}
        }});

        const rendered = shallow(<LoginBanner/>);
        setTimeout(()=>{
            //have not yet found a better way to do this!
            try {
                expect(rendered.find(".welcome").text()).toEqual("Welcome John Doe");
                expect(rendered.find(".username-box").text()).toContain("john_doe")
                done()
            } catch(err){
                done.fail(err);
            }
        }, 500);

    });


})