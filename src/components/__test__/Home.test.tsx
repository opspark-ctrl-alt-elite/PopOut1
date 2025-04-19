import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../Home";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeAll(() => {
  // stub every GET to return an empty array
  mockedAxios.get.mockResolvedValue({ data: [] });
});

describe("Home Component", () => {
  it("renders Become a Vendor button", async () => {
    const user = {
      id: "u1",
      name: "Test User",
      email: "test@example.com",
      is_vendor: false,
    };

    render(
      <MemoryRouter>
        <Home
          user={user}
          vendors={[]}
          captcha={{ beatCaptcha: true, wantsToBeVendor: true }}
          setCaptcha={() => {}}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Become a Vendor/i)).toBeInTheDocument();
    });
  });
});
