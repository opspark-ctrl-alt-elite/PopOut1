import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import VendorProfile from "../VendorProfile";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// silence console.error in tests
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

const user = { id: "u1", name: "Test User", email: "a@b.com" };

function renderWithRouter(ui: React.ReactElement, path = "/vendor/1") {
  window.history.pushState({}, "Test page", path);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/vendor/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

describe("VendorProfile Component", () => {
  beforeEach(() => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === `/api/vendor/${user.id}`) {
        return Promise.resolve({
          data: {
            id: "v1",
            businessName: "Cool Vendor",
            email: "vendor@example.com",
            description: "The best vendor ever!",
            website: "",
            instagram: "",
            facebook: "",
            profilePicture: "",
            userId: user.id,
            createdAt: "",
            updatedAt: "",
          },
        });
      }
      if (url === `/api/images/vendorId/v1`) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error("not found"));
    });
  });

  it("renders vendor info after loading", async () => {
    renderWithRouter(<VendorProfile user={user} getUser={() => {}} />);
    expect(await screen.findByText("Cool Vendor")).toBeInTheDocument();
    expect(screen.getByText("vendor@example.com")).toBeInTheDocument();
    expect(screen.getByText("The best vendor ever!")).toBeInTheDocument();
  });

  it("opens and submits the edit form", async () => {
    renderWithRouter(<VendorProfile user={user} getUser={() => {}} />);

    // wait for profile to load
    await screen.findByText("Cool Vendor");

    // click Edit Profile
    fireEvent.click(screen.getByRole("button", { name: /Edit Profile/i }));

    // change the Business Name field
    fireEvent.change(screen.getByLabelText(/Business Name/i), {
      target: { value: "Cool Vendor Updated" },
    });

    // stub the PATCH
    mockedAxios.patch.mockResolvedValue({ data: {} });

    // confirm
    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `/api/vendor/${user.id}`,
        expect.objectContaining({ businessName: "Cool Vendor Updated" }),
        expect.any(Object)
      );
    });
  });
});
