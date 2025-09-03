import React, { useState } from "react";
import "./App.css";

const crystals = {
  1: "Sun – Carnelian",
  2: "Moon – Clear Quartz",
  3: "Jupiter – Yellow Citrine",
  4: "Rahu – Pyrite",
  5: "Mercury – Green Jade or Green Aventurine",
  6: "Venus – Rose Quartz",
  7: "Ketu – Tiger Eye",
  8: "Saturn – Amethyst",
  9: "Mars – Red Jasper",
};


const reduceToSingle = (num) => {
  let n = Number(num) || 0;
  while (n > 9) {
    n = n
      .toString()
      .split("")
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }
  return n;
};

// Flexible DOB parser
const parseDobFlexible = (dob) => {
  let day, month, year;

  if (dob.includes("/")) {
    const parts = dob.split("/");
    if (parts.length === 3) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
  } else if (dob.length === 8) {
    day = parseInt(dob.slice(0, 2), 10);
    month = parseInt(dob.slice(2, 4), 10);
    year = parseInt(dob.slice(4), 10);
  }

  if (!day || !month || !year) return { ok: false };
  return { ok: true, day, month, year };
};

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  const [phone, setPhone] = useState("");
  const [problems, setProblems] = useState("");

  const getPersonality = ({ day }) =>
    day > 9 ? reduceToSingle(day) : day;

  const getDestiny = ({ day, month, year }) => {
    const digits = `${day}${month}${year}`.split("").map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    return reduceToSingle(sum);
  };

  const getKua = ({ year }, sexVal) => {
    const yearSum = reduceToSingle(
      year
        .toString()
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0)
    );
    const base = sexVal === "Male" ? 11 - yearSum : yearSum + 4;
    return reduceToSingle(base);
  };

  const buildGrid = ({ day, month, year }) => {
    const digits = `${day}${month}${year}`
      .split("")
      .map(Number)
      .filter((n) => n !== 0 && !isNaN(n));

    const grid = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    digits.forEach((d) => grid[d].push(d));
    return grid;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!name || !email || !dob || !sex) {
      setError("Please fill in all fields.");
      return;
    }

    const parsed = parseDobFlexible(dob);
    if (!parsed.ok) {
      setError("Invalid DOB. Use DD/MM/YYYY or DDMMYYYY.");
      return;
    }

    setError("");

    const personality = getPersonality(parsed);
    const destiny = getDestiny(parsed);
    const kua = getKua(parsed, sex);
    const grid = buildGrid(parsed);

    let missing = Object.keys(grid)
      .map(Number)
      .filter((n) => grid[n].length === 0);

    missing = missing.filter((n) => n !== personality && n !== destiny);

    setResult({
      name,
      email,
      sex,
      personality,
      destiny,
      kua,
      grid,
      missing: missing.sort((a, b) => a - b),
    });
  };

  const handleCustomSubmit = (e) => {
  e.preventDefault();

  const templateParams = {
    name,
    dob,
    sex,
    email,
    phone,
    problems,
    missing: result?.missing.join(", "),
    personality: result?.personality,
    destiny: result?.destiny,
    kua: result?.kua,
  };

  emailjs.send(
    "service_3utumto",    
    "Ytemplate_x8vvq94",   
    templateParams,
    "uIGlyuK3r1TB-2GS3"     
  )
  .then(() => {
    alert("✅ Your request has been sent! Our team will contact you soon.");
  })
  .catch((err) => {
    console.error("FAILED...", err);
    alert("⚠️ Something went wrong. Please try again.");
  });
};


  return (
    <div className="App">
      <header className="App-header">
        <img src="/maartlogo.png" alt="Maartstore Logo" width="120" />
        <h1>🔮 Maartstore Numerology App</h1>
        <p>Enter your details to discover your numbers</p>
      </header>

      {!showCustomForm && (
        <main>
          <form className="form" onSubmit={handleCalculate}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY or DDMMYYYY"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Sex:</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="">-- Select --</option>
                <option value="Male">Male ♂</option>
                <option value="Female">Female ♀</option>
              </select>
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit">Calculate</button>
          </form>

          {result && (
            <div className="result-box">
              <h2>Hello, {result.name} ({result.sex})</h2>
              <p>Email: {result.email}</p>

              <p>Personality: <span className="highlight">{result.personality}</span></p>
              <p>Destiny: <span className="highlight">{result.destiny}</span></p>
              <p>KUA: <span className="highlight">{result.kua}</span></p>

              <h3>Lo Shu Grid</h3>
              <div className="grid">
                {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((n) => {
                  let cellClass = "present";
                  if (result.missing.includes(n)) {
                    cellClass = "missing";
                  } else if (
                    n === result.personality ||
                    n === result.destiny ||
                    n === result.kua
                  ) {
                    cellClass = "core";
                  }
                  return (
                    <div key={n} className={`grid-cell ${cellClass}`}>
                      {result.grid[n].length > 0 ? result.grid[n].join(" ") : n}
                    </div>
                  );
                })}
              </div>

              <h3>Recommendations</h3>
              {result.missing.length === 0 && (
                <p>🎉 You have no missing numbers! Keep shining!</p>
              )}
              {result.missing.length === 1 && (
                <div>
                  <p>
                    You are missing number {result.missing[0]} →{" "}
                    {crystals[result.missing[0]]}
                  </p>
                  <a
                    href={`https://maartstore.com/products/${result.missing[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button>Shop Now</button>
                  </a>
                </div>
              )}
              {result.missing.length > 1 && (
  <div>
    <div className="recommendation-text">
      <p>
        Based on your date of birth and Lo Shu Grid, our Maart Store
        numerology specialists have found that some numbers are missing
        in your chart:
      </p>

      <ul>
        {result.missing.map((num) => (
          <li key={num}>
            {num} → {crystals[num]}
          </li>
        ))}
      </ul>

      <p>
        These missing numbers show where a little more balance and
        support is needed in your life.
      </p>
      <p>
        That’s why instead of suggesting just one crystal, we’ll create
        a custom bracelet with the perfect combination of crystals chosen
        specially for you. This blend is designed to bring more luck,
        harmony, and stability, while being easy to wear and maintain.
      </p>
      <p>
        Think of it as your personal energy companion — crafted with care
        to support you every day.
      </p>
    </div>

    <button onClick={() => setShowCustomForm(true)}>
      Request Customized Bracelet
    </button>
  </div>
)}



            </div>
          )}
        </main>
      )}

      {showCustomForm && (
        <main>
          <h2>Request Customized Bracelet</h2>
          <form className="form" onSubmit={handleCustomSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input type="text" value={name} readOnly />
            </div>
            <div className="form-group">
              <label>Date of Birth:</label>
              <input type="text" value={dob} readOnly />
            </div>
            <div className="form-group">
              <label>Sex:</label>
              <input type="text" value={sex} readOnly />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" value={email} readOnly />
            </div>
            <div className="form-group">
              <label>Phone (optional):</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Describe your problems:</label>
              <textarea
                placeholder="Write a few words about your life challenges..."
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
              />
            </div>
            <button type="submit">Send Request</button>
          </form>
        </main>
      )}
    </div>
  );
}

export default App;
