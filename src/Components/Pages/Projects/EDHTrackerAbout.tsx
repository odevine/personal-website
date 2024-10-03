import { Box, Container, Typography, Stack } from "@mui/material";

export const EDHTrackerAbout = () => (
  <Box
    sx={{
      my: 6,
      height: "calc(100vh - 96px)",
      overflowX: "auto",
      "::-webkit-scrollbar": {
        // display: "none",
      },
    }}
  >
    <Container>
      <Stack spacing={2} useFlexGap>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Tracking the Gathering
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          Origins
        </Typography>
        <Typography>
          It was a cold, restless February 19th, 2024, when the winds of our
          gaming group began to shift. The winter had been long, and though we
          once basked in the glory of Rainbow Six Siege nights and just finished
          conquering the chaos of Baldur's Gate 3, those days had passed into
          memory. The group was idle, listless——until a message arrived like a
          beacon of hope in the dark.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-1.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          The seed had been planted. Magic: The Gathering, a vast and storied
          game of strategy, deception, and sometimes just dumb luck, would
          become the new frontier for our tribe. We were a band of friends, the
          remnants of a bygone era of gaming hyperfixations, searching for a new
          obsession to stave off the winter blues until the world thawed once
          again.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-2.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          Our group began to organize. It had been too long since we had shared
          something new together, and everyone was itching for an adventure.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-3.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          Yet, in every group of friends, there is always a contrarian, someone
          holding onto the past. Ours came in the form of a lone, defiant
          Yu-Gi-Oh player. He scoffed at our decision to embrace the game——
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-4.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Box
          component="img"
          src="/images/edh-about-5.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          ——until he found out that anime art cards were, in fact, a thing in
          Magic, too.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-6.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography gutterBottom>
          And so, the Yu-Gi-Oh purist joined the flock.
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          The First Games
        </Typography>
        <Typography>
          With the table set, and the preconstructed decks dusted off or
          delivered, the matches began. Victory and defeat danced across the
          battlefield as the new players rapidly learned the game's intricacies,
          all while the veteran players leveraged their experience, exploiting
          the rookies' mistakes to snatch victories. And yet, amidst all this
          carnage, we had a problem. A glaring issue that only the most
          needlessly competitive individuals in our pod faced:
        </Typography>
        <Typography>
          If no one was tracking our wins and losses...
          <i>did they even matter?</i>
        </Typography>
        <Typography>
          Who would get bragging rights? Who would be crowned the king of our
          'pod'? Who could we ridicule for their long losing streaks? Without
          proper records, these vital questions hung in the air, unresolved.
        </Typography>
        <Typography>Something had to be done.</Typography>
        <Box
          component="img"
          src="/images/edh-about-7.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          And from the ether came the seed for an idea. Despite the Yu-Gi-Oh
          player's early resistance to Magic, it was his insatiable need for
          structure and competition that sparked the idea for tracking our
          matches.
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          Humble Beginnings
        </Typography>
        <Typography>
          And thus, the tracker was born, albeit in the most humble, ugly, and
          difficult to maintain form imaginable. The first iteration was a basic
          Google Sheet, nothing more than an attempt to keep things organized.
          It wasn't pretty, but it worked. Kind of.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-8.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Box
          component="img"
          src="/images/edh-about-9.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Box
          component="img"
          src="/images/edh-about-10.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          Decks were added as individual sheets. The idea was simple: track deck
          iterations, win rates, and match history to keep a running log of our
          progress. The system was messy, a bit unpolished, but for the time, it
          served its purpose. Dropdowns and Google App Scripts allowed us to
          enter matches after they were played (with more effort than one would
          like).
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          Craving Power: The First Upgrades
        </Typography>
        <Typography>
          Naturally, as is the way with Magic: The Gathering pods, the allure of
          preconstructed decks quickly faded. We craved more——more power, more
          creativity, more control. Within two weeks, the group proposed the
          first major change: <strong>a $30 upgrade budget</strong> for each
          preconstructed deck. With this new influx of power came the need to
          modify the tracker. Could we track wins separately between
          preconstructed and upgraded decks? Would upgraded decks count as
          entirely new lists?
        </Typography>
        <Typography>
          Suddenly, the simple spreadsheet I had built began to feel
          insufficient.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-11.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          To manage the chaos, we implemented a system that categorized decks
          rather than logging each individual one. This allowed us to compare
          decks in various power levels without drowning in a sea of individual
          sheets. As a front-end developer, I couldn't help but <i>tweak</i> the
          aesthetics. The spreadsheet got a face-lift, definitely not pretty,
          but at least more functional.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-12.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography variant="caption" sx={{ textAlign: "center" }}>
          <i>
            graphic design is my ✨ <strong>passion</strong> ✨
          </i>
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          The Data Expands
        </Typography>
        <Typography>
          With the spreadsheet evolving, we were now tracking wins by player
          count, along with win rates and overall deck presence. The data was
          growing, and the tracker was doing its job. The $30 upgrade period
          brought about new deck strategies, keeping our group entertained for a
          while. But we weren't done.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-13.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          And, of course, our Yu-Gi-Oh player was not satisfied with merely
          upgraded precons. He wanted more. Preconstructed decks were limiting,
          and the allure of 2,400+ possible commanders was too much for him to
          resist. He longed to build his own masterpiece.
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          The Spreadsheet Grows
        </Typography>
        <Typography>
          To accommodate this surge in creativity, the spreadsheet had to evolve
          yet again. We scrapped the 1-10 power scale in favor of more
          generalized categories, making comparisons simpler and more intuitive.
          A few color tweaks made it visually digestible, but in the back of my
          mind, I knew this entire process could have been easier with a proper
          backend and web interface.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-14.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          The match history page also saw an overhaul, finally relieving us from
          the need to input both player and deck manually. It was a breath of
          fresh air for an increasingly complex system.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-17.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography variant="h5" fontWeight={600}>
          The Endgame? Or Just the Beginning?
        </Typography>
        <Typography>
          From here, the spreadsheet didn't change much. Matches were logged,
          stats were displayed, and for all intents and purposes, the project
          had achieved its goals. The match tracker worked—though not perfectly.
          For now, we had a functional system that could handle the essentials:
          record our wins and losses, track deck categories, and settle any
          disputes with cold, hard data.
        </Typography>
        <Box
          component="img"
          src="/images/edh-about-15.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Box
          component="img"
          src="/images/edh-about-16.png"
          maxWidth={"100%"}
          marginX="auto"
        />
        <Typography>
          But as the games piled up and the group grew more competitive, the
          limitations of the spreadsheet became impossible to ignore. Running
          everything through Google Apps Script had its drawbacks: debugging was
          a pain, the performance was inconsistent, and the collaborative aspect
          was far from ideal.
        </Typography>
        <Typography>
          It was clear that the match tracker had outgrown its humble
          spreadsheet origins. What started as a quick fix for our stat-tracking
          needs had become a much more involved project. I realized that if this
          tracker was going to serve us long-term——and not drive me to the brink
          of insanity——something more robust was needed. It needed to evolve
          beyond its spreadsheet beginnings into a full-fledged application.
        </Typography>
        <Typography>
          And so, with a sense of both dread and excitement, I started
          brainstorming how to turn this mess of dropdowns, formulas, and
          scripts into an actual web app with a proper backend. It was time to
          move beyond Google Sheets and build something designed from the ground
          up to handle the chaos of our MTG sessions.
        </Typography>
      </Stack>
    </Container>
  </Box>
);
