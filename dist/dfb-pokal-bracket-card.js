class OpenLigaDBDFBPokalBracketCard extends HTMLElement {
  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error("You need to define an entity");
    }

    this._config = {
      title: config.title || "DFB-Pokal",
      entity: config.entity,
    };

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 10;
  }

  _render() {
    if (!this._config || !this.shadowRoot || !this._hass) {
      return;
    }

    const state = this._hass.states[this._config.entity];
    if (!state) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="empty">Entity <code>${this._escapeHtml(this._config.entity)}</code> wurde nicht gefunden.</div>
        </ha-card>
      `;
      return;
    }

    const rounds = Array.isArray(state.attributes.rounds) ? [...state.attributes.rounds] : [];
    const roundMap = new Map(rounds.map((round) => [this._normalize(round.round_name), round]));
    const stages = this._buildStages(rounds, roundMap);
    const competition = state.attributes.competition || "";
    const season = state.attributes.season || "";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: var(--primary-text-color);
        }

        ha-card {
          overflow: hidden;
          border-radius: 18px;
          background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color) 6%, transparent), transparent 34%), var(--card-background-color, var(--ha-card-background, #fff));
          box-shadow: var(--ha-card-box-shadow, none);
        }

        .header {
          padding: 16px 18px 10px;
          border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
        }

        .title {
          font-size: 1.05rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .meta {
          margin-top: 5px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          color: var(--secondary-text-color);
          font-size: 0.82rem;
        }

        .chip {
          padding: 4px 10px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--primary-color) 8%, transparent);
        }

        .body {
          padding: 16px;
          overflow-x: auto;
        }

        .bracket {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(220px, 1fr);
          gap: 14px;
          min-width: 1420px;
        }

        .round-column {
          display: grid;
          gap: 10px;
          align-content: start;
        }

        .round-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 12px 12px 10px;
          border: 1px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
          border-radius: 14px;
          background: color-mix(in srgb, var(--secondary-background-color) 66%, transparent);
        }

        .round-name {
          font-weight: 800;
          line-height: 1.15;
        }

        .round-count {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--secondary-text-color);
          white-space: nowrap;
        }

        .slot-list {
          display: grid;
          gap: 10px;
        }

        .slot-card {
          min-height: 116px;
          padding: 12px;
          border-radius: 16px;
          border: 1px solid color-mix(in srgb, var(--divider-color) 80%, transparent);
          background: color-mix(in srgb, var(--primary-color) 3%, transparent);
          display: grid;
          gap: 10px;
        }

        .slot-card.filled {
          background: color-mix(in srgb, var(--secondary-background-color) 72%, transparent);
        }

        .slot-card.favorite-match {
          border-color: color-mix(in srgb, var(--primary-color) 55%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color) 16%, transparent);
        }

        .slot-card.live {
          border-color: color-mix(in srgb, #2dff7a 55%, transparent);
          box-shadow: inset 0 0 0 1px rgba(45, 255, 122, 0.12);
        }

        .slot-card.empty {
          border-style: dashed;
          background: color-mix(in srgb, var(--divider-color) 5%, transparent);
          opacity: 0.72;
        }

        .teams {
          display: grid;
          gap: 8px;
        }

        .match-core {
          display: grid;
          gap: 10px;
          align-content: center;
        }

        .team-line {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr);
          gap: 8px;
          align-items: center;
          min-width: 0;
        }

        .team-line.favorite {
          color: var(--primary-color);
          font-weight: 800;
        }

        .team-line.loser {
          opacity: 0.42;
          filter: grayscale(1);
        }

        .team-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }

        .team-name {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 700;
          line-height: 1.1;
        }

        .score-row {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 10px;
          font-size: 1.95rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .score-row .sep {
          font-size: 1.1rem;
          color: var(--secondary-text-color);
        }

        .score-row.vs {
          font-size: 1rem;
          color: var(--secondary-text-color);
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .match-details {
          display: grid;
          gap: 4px;
          padding-top: 2px;
          border-top: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
          font-size: 0.78rem;
          color: var(--secondary-text-color);
        }

        .match-detail {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: baseline;
        }

        .match-detail strong {
          color: var(--primary-text-color);
          font-size: 0.76rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .match-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          font-size: 0.78rem;
          color: var(--secondary-text-color);
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--primary-color) 9%, transparent);
          color: var(--primary-text-color);
          font-weight: 700;
        }

        .status.live {
          background: rgba(0, 200, 83, 0.14);
          color: #2dff7a;
        }

        .empty-slot {
          display: grid;
          place-items: center;
          min-height: 92px;
          border-radius: 12px;
          border: 1px dashed color-mix(in srgb, var(--divider-color) 80%, transparent);
          color: var(--secondary-text-color);
          font-size: 0.82rem;
          text-align: center;
          padding: 12px;
        }

        .empty {
          padding: 16px;
          color: var(--secondary-text-color);
        }

        @media (max-width: 900px) {
          .bracket {
            min-width: 1180px;
          }
        }
      </style>
      <ha-card>
        <div class="header">
          <div class="title">${this._escapeHtml(this._config.title)}</div>
          <div class="meta">
            ${competition ? `<span class="chip">${this._escapeHtml(competition)}</span>` : ""}
            ${season ? `<span class="chip">Saison ${this._escapeHtml(String(season))}</span>` : ""}
            <span class="chip">K.-o.-Runde</span>
          </div>
        </div>
        <div class="body">
          <div class="bracket">
            ${stages.map((stage) => this._renderStage(stage)).join("")}
          </div>
        </div>
      </ha-card>
    `;
  }

  _buildStages(rounds, roundMap) {
    const stageDefinitions = [
      { name: "1. Runde", aliases: ["1. runde", "runde 1", "erste runde"] },
      { name: "2. Runde", aliases: ["2. runde", "runde 2", "zweite runde"] },
      { name: "Achtelfinale", aliases: ["achtelfinale"] },
      { name: "Viertelfinale", aliases: ["viertelfinale"] },
      { name: "Halbfinale", aliases: ["halbfinale"] },
      { name: "Endspiel", aliases: ["endspiel", "finale"] },
    ];

    const firstRoundCount = this._extractRoundCount(roundMap.get(this._normalize("1. Runde"))) || 32;
    return stageDefinitions.map((definition, index) => {
      const round = this._findRound(roundMap, definition.aliases);
      const expectedSlots = Math.max(1, Math.ceil(firstRoundCount / Math.pow(2, index)));
      const matches = Array.isArray(round?.matches) ? round.matches : [];
      const emptySlots = Math.max(0, expectedSlots - matches.length);
      return {
        name: definition.name,
        round,
        expectedSlots,
        emptySlots,
      };
    });
  }

  _findRound(roundMap, aliases) {
    for (const alias of aliases) {
      const found = roundMap.get(this._normalize(alias));
      if (found) {
        return found;
      }
    }
    return null;
  }

  _extractRoundCount(round) {
    if (!round) {
      return null;
    }
    const matchCount = Number.parseInt(round.match_count, 10);
    if (Number.isFinite(matchCount) && matchCount > 0) {
      return matchCount;
    }
    const matches = Array.isArray(round.matches) ? round.matches.length : 0;
    return matches > 0 ? matches : null;
  }

  _renderStage(stage) {
    const round = stage.round;
    const matches = Array.isArray(round?.matches) ? round.matches : [];
    const finishedCount = Number.parseInt(round?.finished_count ?? 0, 10) || 0;
    const roundCount = Number.parseInt(round?.match_count ?? matches.length, 10) || matches.length;
    const totalSlots = stage.expectedSlots;
    const emptySlots = stage.emptySlots;

    return `
      <div class="round-column">
        <div class="round-head">
          <div class="round-name">${this._escapeHtml(stage.name)}</div>
          <div class="round-count">${finishedCount}/${roundCount} Spiele</div>
        </div>
        <div class="slot-list">
          ${matches.map((match) => this._renderMatchCard(match)).join("")}
          ${Array.from({ length: emptySlots }, () => this._renderEmptyCard(stage.name)).join("")}
        </div>
      </div>
    `;
  }

  _renderMatchCard(match) {
    const kickoff = match.kickoff ? new Date(match.kickoff) : null;
    const homeUrl = match.home_team_url || match.home_team_icon_url;
    const awayUrl = match.away_team_url || match.away_team_icon_url;
    const hasScore = match.home_score !== null && match.away_score !== null;
    const phase = this._matchPhase(match);
    const favoriteSide = match.is_favorite_match ? match.favorite_team_side : null;
    const outcome = this._matchOutcome(match);

    return `
      <div class="slot-card ${phase === "live" ? "live" : "filled"} ${favoriteSide ? "favorite-match" : ""}">
        <div class="match-core">
          <div class="teams">
            <div class="team-line ${favoriteSide === "home" ? "favorite" : ""} ${outcome.loserSide === "home" ? "loser" : ""}">
              ${homeUrl ? `<img class="team-logo" src="${this._escapeHtml(homeUrl)}" alt="">` : ""}
              <div class="team-name">${this._escapeHtml(match.home_team || "-")}</div>
            </div>
          </div>

          <div class="score-row ${hasScore ? "" : "vs"}">
            ${
              hasScore
                ? `<span>${this._escapeHtml(String(match.home_score))}</span><span class="sep">:</span><span>${this._escapeHtml(String(match.away_score))}</span>`
                : `<span>vs</span>`
            }
          </div>

          <div class="teams">
            <div class="team-line ${favoriteSide === "away" ? "favorite" : ""} ${outcome.loserSide === "away" ? "loser" : ""}">
              ${awayUrl ? `<img class="team-logo" src="${this._escapeHtml(awayUrl)}" alt="">` : ""}
              <div class="team-name">${this._escapeHtml(match.away_team || "-")}</div>
            </div>
          </div>

          ${this._renderMatchDetails(match)}
        </div>

        <div class="match-footer">
          <span>${kickoff ? this._shortDateTime(kickoff) : ""}</span>
          ${phase === "live" ? `<span class="status live">LIVE</span>` : ""}
        </div>
      </div>
    `;
  }

  _renderMatchDetails(match) {
    const lines = this._resultDetails(match);

    if (!lines.length) {
      return "";
    }

    return `
      <div class="match-details">
        ${lines
          .map(
            (line) => `
              <div class="match-detail">
                <strong>${this._escapeHtml(line.label)}</strong>
                <span>${this._escapeHtml(line.value)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  _matchOutcome(match) {
    const winnerSide = this._winnerSide(match);
    const loserSide = winnerSide === "home" ? "away" : winnerSide === "away" ? "home" : null;
    return { winnerSide, loserSide };
  }

  _winnerSide(match) {
    const details = this._resultDetails(match);
    const resultPriority = ["i.E.", "n.V.", "FT"];

    for (const label of resultPriority) {
      const detail = details.find((item) => item.label === label);
      if (!detail) {
        continue;
      }

      const winner = this._winnerFromScores(detail.home_score, detail.away_score);
      if (winner) {
        return winner;
      }
    }

    return this._winnerFromScores(match.home_score, match.away_score);
  }

  _resultDetails(match) {
    if (Array.isArray(match?.result_details) && match.result_details.length) {
      return match.result_details
        .filter((item) => item && item.label && item.home_score !== null && item.away_score !== null)
        .map((item) => ({
          label: item.label,
          value: `${item.home_score} : ${item.away_score}`,
          order: Number.parseInt(item.order, 10) || 0,
        }))
        .sort((left, right) => left.order - right.order);
    }

    const fallback = [];
    const pushFallback = (label, homeScore, awayScore) => {
      if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
        return;
      }
      fallback.push({
        label,
        value: `${homeScore} : ${awayScore}`,
        order: fallback.length + 1,
      });
    };

    pushFallback("HZ", match.half_time_home_score, match.half_time_away_score);
    pushFallback("FT", match.home_score, match.away_score);
    pushFallback("n.V.", match.extra_time_home_score, match.extra_time_away_score);
    pushFallback("i.E.", match.penalty_home_score, match.penalty_away_score);
    return fallback;
  }

  _winnerFromScores(homeScore, awayScore) {
    if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
      return null;
    }
    if (homeScore > awayScore) {
      return "home";
    }
    if (awayScore > homeScore) {
      return "away";
    }
    return null;
  }

  _renderEmptyCard(stageName) {
    return `
      <div class="slot-card empty">
        <div class="empty-slot">
          <div>
            <div style="font-weight:700; margin-bottom:4px;">offen</div>
            <div>noch nicht ausgelost</div>
            <div style="margin-top:4px;">${this._escapeHtml(stageName)}</div>
          </div>
        </div>
      </div>
    `;
  }

  _matchPhase(match) {
    const kickoff = match?.kickoff ? new Date(match.kickoff) : null;
    if (!kickoff || Number.isNaN(kickoff.getTime())) {
      return "unknown";
    }
    const now = new Date();
    const end = new Date(kickoff.getTime() + 105 * 60 * 1000);
    if (now < kickoff) {
      return "upcoming";
    }
    if (now >= kickoff && now < end) {
      return "live";
    }
    return "ended";
  }

  _shortDateTime(date) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  _normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[ä]/g, "ae")
      .replace(/[ö]/g, "oe")
      .replace(/[ü]/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]/g, "");
  }

  _escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  static getConfigForm() {
    return {
      schema: [
        {
          name: "entity",
          required: true,
          selector: {
            entity: {
              domain: "sensor",
            },
          },
        },
        {
          name: "title",
          selector: {
            text: {},
          },
        },
      ],
      computeLabel: (schema) => {
        switch (schema.name) {
          case "entity":
            return "Sensor";
          case "title":
            return "Titel";
          default:
            return undefined;
        }
      },
      computeHelper: (schema) => {
        if (schema.name === "entity") {
          return "Waehle den DFB-Pokal-Runden-Sensor aus.";
        }
        if (schema.name === "title") {
          return "Wird als Karten-Titel angezeigt.";
        }
        return undefined;
      },
      assertConfig: (config) => {
        if (!config.entity) {
          throw new Error("An entity is required.");
        }
      },
    };
  }

  static getStubConfig() {
    return {
      type: "custom:openligadb-dfb-pokal-bracket-card",
      entity: "sensor.dfb_pokal_2026_round_overview",
      title: "DFB-Pokal",
    };
  }

  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }
}

if (!window.customCards) {
  window.customCards = [];
}

window.customCards.push({
  type: "openligadb-dfb-pokal-bracket-card",
  name: "OpenLigaDB DFB-Pokal Bracket Card",
  description: "Shows the DFB-Pokal rounds as a knockout bracket with placeholders for upcoming rounds.",
  getEntitySuggestion: (hass, entityId) => {
    const state = hass.states[entityId];
    if (!state || state.attributes?.rounds === undefined) {
      return null;
    }

    return {
      config: {
        type: "custom:openligadb-dfb-pokal-bracket-card",
        entity: entityId,
        title: state.attributes.competition ? `${state.attributes.competition} K.-o.-Baum` : "DFB-Pokal",
      },
    };
  },
});

customElements.define("openligadb-dfb-pokal-bracket-card", OpenLigaDBDFBPokalBracketCard);
