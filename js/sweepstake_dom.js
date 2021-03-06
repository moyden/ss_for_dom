/* global Vue, d3 */

// eslint-disable-next-line no-unused-vars
const vm = new Vue({
  el: '#sweep',

  created: function () {
    this.fetchTeams();
    this.fetchData();
  },

  computed: {
    sorted: function () {
      // return this.teams.sort(function (a, b) {
      //   if (a.gc !== b.gc) return a.gc < b.gc ? 1 : -1
      //   else return a.name > b.name ? 1 : -1
      // })
      return this.teams;
    },

    aggregate: function () {
      let output = [];
      this.teams.forEach(team => {
        let found = false;
        output.forEach(d => {
          if (d.value === team.gc) {
            found = true;
            d.teams.push(team);
          }
        });
        if (!found) {
          output.push({
            value: team.gc,
            teams: [team]
          });
        }
      });
      output.sort((a, b) => b.value - a.value);
      return output;
    }
  },

  data: {
    teams: []
  },

  methods: {
    fetchTeams: function () {
      let self = this;
      d3.json('assets/teams.json').then(function (data) {
        self.teams = data;
        self.teams.forEach(team => {
          if (team.name === '') team.name = team.country;
        });
      });
    },

    fetchData: function () {
      let self = this;
      d3.json('https://api.football-data.org/v1/competitions/467/fixtures', {
        headers: { 'X-Auth-Token': 'ad8f2917e7174b859a89e00b4127b407' }
      }).then(function (data) {
        const fixtures = data.fixtures.map(d => {
          return {
            homeTeamName: d.homeTeamName,
            awayTeamName: d.awayTeamName,
            goalsHomeTeam: d.result.extraTime ? d.result.extraTime.goalsHomeTeam + d.result.goalsHomeTeam : d.result.goalsHomeTeam,
            goalsAwayTeam: d.result.extraTime ? d.result.extraTime.goalsAwayTeam + d.result.goalsAwayTeam : d.result.goalsAwayTeam
          };
        });

        fixtures.forEach(match => {
          self.teams.forEach(team => {
            if (match.homeTeamName === team.country) team.gc += match.goalsAwayTeam;
            if (match.awayTeamName === team.country) team.gc += match.goalsHomeTeam;
          });
        });
      });
    }
  }
});
