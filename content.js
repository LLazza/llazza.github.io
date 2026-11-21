/* =========================================================================
   ALL THE TEXT ON THE WEBSITE LIVES HERE.
   Edit this file to update the site; you never need to touch index.html.

   A few rules so nothing breaks:
   • Text goes between quotes: "like this". If the text itself contains a
     double quote, write \" instead.
   • Every item in a list ends with a comma.
   • To add something (a paper, a course…), copy an existing block from
     { to }, paste it, and change the words.
   • PDFs go in the  files/  folder; refer to them as "files/name.pdf".
   ========================================================================= */

const SITE = {

  /* ----------------------------------------------------------------- ABOUT */
  about: {
    // Each line is one paragraph.
    paragraphs: [
      "I am a Ph.D. candidate in Management and Economics at the University of Zurich, at the Chair of Marketing for Social Impact and the University Research Priority Program in Social Networks.",
      "My research explores the collective dynamics of social influence on social networks and what they mean for interventions. In my projects, I combine behavioral experiments and simulations to study how behaviors spread through networks, and use field data to study how local knowledge can help design network interventions that work.",
    ],
    // Written with [at] so bots can't collect it.
    email: "luca.lazzaro [at] uzh.ch",
    links: [
      { label: "Google Scholar", url: "https://scholar.google.com/citations?user=0xQdp6kAAAAJ" },
      { label: "LinkedIn",       url: "https://www.linkedin.com/in/luca-lazzaro/" },
      { label: "Bluesky",        url: "https://bsky.app/profile/llazza.bsky.social" },
    ],
  },

  /* -------------------------------------------------------------- RESEARCH */
  // Your name is written in bold automatically wherever it appears as ME.
  me: "Lazzaro L",

  research: {
    // Groups appear in this order; papers within a group too.
    groups: [
      {
        title: "Publications & under review",
        papers: [
          {
            title: "What shifts threshold distributions in social contagions?",
            authors: "Lazzaro L, Mariani SM, Algesheimer R, Tanase R",
            venue: "Under review, Science Advances",
            links: [{ label: "Working paper", url: "https://ssrn.com/abstract=5570300" }],
          },
          {
            title: "The amplifier effect of artificial agents in social contagion",
            authors: "Feng M, Hitz E, Lazzaro L, Tanase R, Algesheimer R, Mariani SM",
            venue: "npj Complexity, 2026",
            links: [],
          },
        ],
      },
      {
        title: "Working papers",
        papers: [
          {
            title: "Identifying central individuals without mapping the social network",
            authors: "Lazzaro L, Feng M, Furrer N, Delvaux M, Kambiré SB, Cammelli F, Mariani SM, Algesheimer R, Adou Yao CY, Tanase R",
            venue: "",
            links: [{ label: "Working paper", url: "https://ssrn.com/abstract=6943599" }],
          },
          {
            title: "Causal effects of targeting natural early adopters on participation in a voluntary environmental program",
            authors: "Zhang H, Lazzaro L, Furrer N, Cammelli F, Mariani SM, Kambiré SB, Addoah T, Algesheimer R, Garrett RD, Adou Yao CY, Tanase R",
            venue: "",
            links: [],
          },
          {
            title: "The role of awareness in new product diffusion",
            authors: "Lazzaro L",
            venue: "",
            links: [],
          },
        ],
      },
    ],
  },

  /* -------------------------------------------------------------- TEACHING */
  teaching: {
    groups: [
      {
        title: "As instructor",
        courses: [
          { name: "R – a non-technical introduction with applications to Marketing", place: "University of Zurich" },
          { name: "Marketing Analytics", place: "Università Cattolica del Sacro Cuore" },
        ],
      },
      {
        title: "As teaching assistant",
        courses: [
          { name: "Personal Branding",                       place: "University of Zurich" },
          { name: "Personal Branding Applications",          place: "University of Zurich" },
          { name: "Digital Marketing: Collaborative Project", place: "University of Zurich" },
        ],
      },
    ],
  },

  /* -------------------------------------------------------------------- CV */
  cv: {
    pdf: "files/cv.pdf",            // replace this file to update the CV
  },
};
