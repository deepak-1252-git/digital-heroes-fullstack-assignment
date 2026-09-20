import supabase from "../config/supabase.js";

const MIN_SCORE = 1;
const MAX_SCORE = 45;
const DRAW_SIZE = 5;

const PRIZE_PERCENTAGES = {
  5: 40,
  4: 35,
  3: 25,
};

// Generate 5 unique random numbers between 1-45
const generateRandomNumbers = () => {
  const numbers = new Set();

  while (numbers.size < DRAW_SIZE) {
    const number =
      Math.floor(Math.random() * (MAX_SCORE - MIN_SCORE + 1)) +
      MIN_SCORE;

    numbers.add(number);
  }

  return [...numbers].sort((a, b) => a - b);
};

// Compare user's 5 scores with draw numbers
const calculateMatchCount = (userNumbers, drawNumbers) => {
  return userNumbers.filter((number) =>
    drawNumbers.includes(number)
  ).length;
};

// Get latest 5 scores of a user
const getLatestFiveScores = async (userId) => {
  const { data, error } = await supabase
    .from("scores")
    .select("score, played_at, created_at")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Get active subscribers
const getActiveSubscribers = async () => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      user_id,
      status,
      plan_id,
      subscription_plans (
        price,
        billing_interval
        prize_pool_percentage
      )
    `)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Create a draw simulation
const simulateDraw = async ({ drawType = "random" }) => {
  if (!["random", "algorithmic"].includes(drawType)) {
    throw new Error("Invalid draw type");
  }

  const drawNumbers = generateRandomNumbers();

  const subscribers = await getActiveSubscribers();

  const entries = [];

  for (const subscriber of subscribers) {
    const scores = await getLatestFiveScores(subscriber.user_id);

    // User needs 5 scores to participate
    if (scores.length < 5) {
      continue;
    }

    const userNumbers = scores.map((item) => item.score);

    const matchCount = calculateMatchCount(
      userNumbers,
      drawNumbers
    );

    entries.push({
      user_id: subscriber.user_id,
      numbers: userNumbers,
      match_count: matchCount,
    });
  }

  const winners = {
    fiveMatch: entries.filter((entry) => entry.match_count === 5),
    fourMatch: entries.filter((entry) => entry.match_count === 4),
    threeMatch: entries.filter((entry) => entry.match_count === 3),
  };

  return {
    drawNumbers,
    totalParticipants: entries.length,
    entries,
    winners,
  };
};


const getPreviousJackpotRollover = async (drawMonth) => {
  const { data, error } = await supabase
    .from("draws")
    .select("id, draw_month")
    .lt("draw_month", drawMonth)
    .eq("status", "published")
    .order("draw_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return 0;
  }

  const { data: prizePool, error: prizeError } = await supabase
    .from("prize_pools")
    .select("rollover_amount")
    .eq("draw_id", data.id)
    .eq("tier", "5_match")
    .maybeSingle();

  if (prizeError) {
    throw new Error(prizeError.message);
  }

  return Number(prizePool?.rollover_amount || 0);
};


const calculatePrizePool = async () => {
  const subscribers = await getActiveSubscribers();

  let totalSubscriptionAmount = 0;
  let prizePoolPercentage = 0;

  for (const subscriber of subscribers) {
    const plan = subscriber.subscription_plans;

    if (!plan) continue;

    totalSubscriptionAmount += Number(plan.price || 0);

    // Plans currently use the same percentage.
    prizePoolPercentage = Number(
      plan.prize_pool_percentage || 20
    );
  }

  const totalPrizePool =
    totalSubscriptionAmount * (prizePoolPercentage / 100);

  return {
    totalSubscriptionAmount,
    prizePoolPercentage,
    totalPrizePool,
  };
};


const publishDraw = async ({
  drawMonth,
  drawType = "random",
  drawNumbers,
}) => {

  if (!drawMonth) {
    throw new Error("drawMonth is required");
  }

  if (!Array.isArray(drawNumbers) || drawNumbers.length !== 5) {
    throw new Error("Draw must contain exactly 5 numbers");
  }

  const uniqueNumbers = [...new Set(drawNumbers)];

  if (uniqueNumbers.length !== 5) {
    throw new Error("Draw numbers must be unique");
  }

  if (
    uniqueNumbers.some(
      (number) =>
        !Number.isInteger(number) ||
        number < MIN_SCORE ||
        number > MAX_SCORE
    )
  ) {
    throw new Error("Draw numbers must be between 1 and 45");
  }

  // Prevent duplicate monthly draws
  const { data: existingDraw } = await supabase
    .from("draws")
    .select("id")
    .eq("draw_month", drawMonth)
    .maybeSingle();

  if (existingDraw) {
    throw new Error(
      "A draw already exists for this month"
    );
  }

  // Get all active subscribers
  const subscribers = await getActiveSubscribers();

  const entries = [];

  for (const subscriber of subscribers) {

    const scores = await getLatestFiveScores(
      subscriber.user_id
    );

    // Need exactly 5 scores
    if (scores.length < 5) {
      continue;
    }

    const userNumbers = scores.map(
      (item) => item.score
    );

    const matchCount = calculateMatchCount(
      userNumbers,
      uniqueNumbers
    );

    entries.push({
      user_id: subscriber.user_id,
      numbers: userNumbers,
      match_count: matchCount,
    });
  }

  // Calculate total subscription prize pool
  const {
    totalSubscriptionAmount,
    prizePoolPercentage,
    totalPrizePool,
  } = await calculatePrizePool();

  // Previous jackpot rollover
  const previousRollover =
    await getPreviousJackpotRollover(drawMonth);

  const fiveMatchBase =
    totalPrizePool * 0.40;

  const fourMatchAmount =
    totalPrizePool * 0.35;

  const threeMatchAmount =
    totalPrizePool * 0.25;

  const fiveMatchTotal =
    fiveMatchBase + previousRollover;

  // Create draw
  const { data: draw, error: drawError } =
    await supabase
      .from("draws")
      .insert({
        draw_month: drawMonth,
        draw_type: drawType,
        status: "published",
        numbers: uniqueNumbers,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

  if (drawError) {
    throw new Error(drawError.message);
  }

  // Save draw entries
  if (entries.length > 0) {

    const drawEntries = entries.map((entry) => ({
      draw_id: draw.id,
      user_id: entry.user_id,
      numbers: entry.numbers,
      match_count: entry.match_count,
    }));

    const { error: entriesError } =
      await supabase
        .from("draw_entries")
        .insert(drawEntries);

    if (entriesError) {
      throw new Error(entriesError.message);
    }
  }

  const fiveWinners = entries.filter(
    (entry) => entry.match_count === 5
  );

  const fourWinners = entries.filter(
    (entry) => entry.match_count === 4
  );

  const threeWinners = entries.filter(
    (entry) => entry.match_count === 3
  );

  // Jackpot rolls over only when nobody gets 5 matches
  const fiveRollover =
    fiveWinners.length === 0
      ? fiveMatchTotal
      : 0;

  // Create prize pools
  const prizePools = [
    {
      draw_id: draw.id,
      tier: "5_match",
      percentage: 40,
      total_amount: fiveMatchTotal,
      rollover_amount: fiveRollover,
    },
    {
      draw_id: draw.id,
      tier: "4_match",
      percentage: 35,
      total_amount: fourMatchAmount,
      rollover_amount: 0,
    },
    {
      draw_id: draw.id,
      tier: "3_match",
      percentage: 25,
      total_amount: threeMatchAmount,
      rollover_amount: 0,
    },
  ];

  const {
    data: insertedPools,
    error: poolsError,
  } = await supabase
    .from("prize_pools")
    .insert(prizePools)
    .select();

  if (poolsError) {
    throw new Error(poolsError.message);
  }

  const poolMap = {};

  insertedPools.forEach((pool) => {
    poolMap[pool.tier] = pool;
  });

  const createWinners = (
    winnerList,
    tier,
    totalAmount
  ) => {

    if (winnerList.length === 0) {
      return [];
    }

    const prizePerWinner =
      totalAmount / winnerList.length;

    return winnerList.map((winner) => ({
      draw_id: draw.id,
      user_id: winner.user_id,
      prize_pool_id: poolMap[tier].id,
      match_count:
        tier === "5_match"
          ? 5
          : tier === "4_match"
            ? 4
            : 3,
      prize_amount: Number(
        prizePerWinner.toFixed(2)
      ),
      verification_status: "pending",
      payout_status: "pending",
    }));
  };

  const winners = [
    ...createWinners(
      fiveWinners,
      "5_match",
      fiveMatchTotal
    ),

    ...createWinners(
      fourWinners,
      "4_match",
      fourMatchAmount
    ),

    ...createWinners(
      threeWinners,
      "3_match",
      threeMatchAmount
    ),
  ];

  if (winners.length > 0) {

    const { error: winnersError } =
      await supabase
        .from("winners")
        .insert(winners);

    if (winnersError) {
      throw new Error(winnersError.message);
    }
  }

  return {
    draw,
    participants: entries.length,
    winners,
    prizePool: {
      totalSubscriptionAmount,
      prizePoolPercentage,
      totalPrizePool,
      previousRollover,
      fiveMatch: fiveMatchTotal,
      fourMatch: fourMatchAmount,
      threeMatch: threeMatchAmount,
    },
  };
};

export {
  generateRandomNumbers,
  calculateMatchCount,
  getLatestFiveScores,
  getActiveSubscribers,
  simulateDraw,
  publishDraw,
  calculatePrizePool,
  getPreviousJackpotRollover,
  PRIZE_PERCENTAGES,
};