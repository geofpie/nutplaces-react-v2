import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Tab,
  Tabs
} from "@heroui/react";
import { consumeMagicLink, requestOtp, verifyOtp } from "./api.js";

const NAV_ITEMS = ["Home", "Food", "Activities", "Check In"];

function useMagicLinkLogin(setAuthState, setStatusMessage) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      return;
    }
    consumeMagicLink(token)
      .then((data) => {
        localStorage.setItem("auth_token", data.access_token);
        setAuthState(true);
        setStatusMessage("Magic link accepted. Welcome back!");
        window.history.replaceState({}, document.title, "/");
      })
      .catch(() => {
        setStatusMessage("Magic link expired or invalid.");
      });
  }, [setAuthState, setStatusMessage]);
}

export default function App() {
  const [telegramUid, setTelegramUid] = useState("");
  const [pin, setPin] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("auth_token"))
  );

  useMagicLinkLogin(setIsAuthenticated, setStatusMessage);

  const navTabs = useMemo(
    () =>
      NAV_ITEMS.map((label) => (
        <Tab key={label} title={label}>
          <div className="page-panel">
            <h2>{label}</h2>
            <p>Start building your bucket list here.</p>
          </div>
        </Tab>
      )),
    []
  );

  const handleRequestOtp = async () => {
    setStatusMessage("");
    try {
      const response = await requestOtp(telegramUid.trim());
      if (response.debug_pin) {
        setStatusMessage(`OTP sent. Dev PIN: ${response.debug_pin}`);
      } else {
        setStatusMessage("OTP sent via Telegram bot.");
      }
    } catch (error) {
      setStatusMessage("Failed to send OTP. Are you whitelisted?");
    }
  };

  const handleVerifyOtp = async () => {
    setStatusMessage("");
    try {
      const response = await verifyOtp(telegramUid.trim(), pin.trim());
      localStorage.setItem("auth_token", response.access_token);
      setIsAuthenticated(true);
    } catch (error) {
      setStatusMessage("Invalid OTP or expired.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
  };

  return (
    <div className="app-shell">
      <Navbar className="top-nav" maxWidth="xl">
        <NavbarBrand>NutPlaces</NavbarBrand>
        <NavbarContent justify="end">
          {isAuthenticated ? (
            <NavbarItem>
              <Button color="danger" variant="flat" onPress={handleLogout}>
                Log out
              </Button>
            </NavbarItem>
          ) : null}
        </NavbarContent>
      </Navbar>

      {!isAuthenticated ? (
        <main className="login-grid">
          <Card className="login-card" shadow="lg">
            <CardHeader>
              <h1>Welcome back</h1>
            </CardHeader>
            <CardBody className="login-body">
              <p className="subtitle">
                Log in with your Telegram UID, then choose a quick OTP or magic link.
              </p>
              <div className="form-stack">
                <Input
                  label="Telegram UID"
                  placeholder="Enter your Telegram user id"
                  value={telegramUid}
                  onValueChange={setTelegramUid}
                />
                <Button color="primary" onPress={handleRequestOtp}>
                  Send OTP via Telegram
                </Button>
                <Input
                  label="OTP Pin"
                  placeholder="Enter the pin"
                  value={pin}
                  onValueChange={setPin}
                />
                <Button color="secondary" onPress={handleVerifyOtp}>
                  Verify OTP
                </Button>
              </div>
              <div className="divider">or</div>
              <div className="magic-instructions">
                <p>In your Telegram group chat, type <strong>/app</strong>.</p>
                <p>We will send a magic link that expires in 5 minutes.</p>
              </div>
              {statusMessage ? <p className="status">{statusMessage}</p> : null}
            </CardBody>
          </Card>
        </main>
      ) : (
        <main className="home-grid">
          <section className="hero">
            <h1>Bucket list, but for cravings.</h1>
            <p>
              Track food, activities, and quick check-ins for the moments you want to
              relive.
            </p>
          </section>
          <section className="nav-panel">
            <Tabs
              aria-label="Navigation"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(String(key))}
              color="primary"
              variant="light"
            >
              {navTabs}
            </Tabs>
          </section>
        </main>
      )}
    </div>
  );
}
