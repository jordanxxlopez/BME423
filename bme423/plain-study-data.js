// Built by authoring/plain_study.py from plain_study_content.py. Do not edit by hand.
const PLAIN_STUDY={
"revision": "plain-study-1",
"tiers": {
"asked": "Asked on Exam 1",
"review": "On the review and homework",
"out": "Not on the midterm",
"m2": "Module II · Homework 3",
"m2b": "Module II · after Homework 3"
},
"lectures": [
{
"id": 2,
"tier": "review",
"title": "Describing data with a few numbers",
"lead": "A sample is used to learn about a population, so the first job is to summarize the sample and know what kind of data it is.",
"topics": [
{
"title": "Population values and sample estimates",
"blocks": [
{
"pages": [
3,
7
],
"main": "**A population is the whole group you care about, and a sample is the smaller group you actually measure.** The population mean and standard deviation are fixed values that are usually unknown. The sample mean and sample standard deviation are calculated from the measured people, so they estimate those population values.",
"sub": [
"The **standard deviation** (SD) describes how far individual measurements usually sit from the mean.",
"The sample variance divides by n minus 1 instead of n, because the sample mean sits a little too close to its own data and would make the spread look too small."
],
"end": "So every summary you calculate from a sample is an estimate of a population value."
},
{
"pages": [
4,
5,
6
],
"main": "**A Normal population is symmetric and bell shaped, so its mean and median sit at the same place.** About two thirds of the values fall within one SD of the mean, and about 95 percent fall within two SDs.",
"sub": [
"A **skewed** distribution has one long tail, so the mean is pulled toward that tail and no longer matches the median."
],
"end": "That is why the shape of the data decides whether the mean or the median is the better center."
}
]
},
{
"title": "Median, quartiles and percentiles",
"blocks": [
{
"pages": [
8,
9,
10
],
"main": "**A percentile is the value below which a given percent of the ordered data falls.** The median is the 50th percentile, and the quartiles are the 25th and 75th percentiles. To find one, sort the data first, because positions only make sense in order.",
"sub": [
"The position of the pth percentile is 1 plus p times (n minus 1), divided by 100.",
"When the position lands between two observations, the percentile is placed between those two values by the same fraction."
],
"end": "So a percentile always comes from a position in the sorted list, not from the raw order the data arrived in."
},
{
"pages": [
11,
12,
13
],
"main": "**A box plot shows the median and the middle half of the data, and a violin plot also shows the shape.** The box runs from the 25th to the 75th percentile, so its length is the **interquartile range** (the spread of the middle half). A violin plot is wider where values are common, so it shows where the data bunch up."
}
]
},
{
"title": "Why averages vary less than individuals",
"blocks": [
{
"pages": [
15,
16,
17,
18,
19
],
"main": "**Means of samples vary less than single measurements, because high and low values cancel out inside each average.** If many samples of ten were taken, their means would form their own distribution centered on the population mean. The spread of that distribution is the **standard error** of the mean (SE, the SD of sample means).",
"sub": [
"The standard error equals the SD divided by the square root of the sample size, so larger samples give more precise means.",
"The **central limit theorem** says that these sample means are close to Normal even when the individual values are not."
],
"end": "So the SD describes people, and the SE describes how much the mean would change from sample to sample."
}
]
},
{
"title": "Kinds of data",
"blocks": [
{
"pages": [
20,
21,
25
],
"main": "**The kind of data decides which method you can use, so classify the variable before anything else.** **Interval** data are numbers with equal steps, and they are continuous (any value, like blood pressure) or discrete (counts, like tender joints). **Categorical** data are groups, and they are nominal (no order, like zip code) or ordinal (ordered, like an Apgar score).",
"end": "So the first question for any problem is what was recorded for each subject."
}
]
}
],
"questions": [
{
"q": "What is the difference between the standard deviation and the standard error?",
"a": "The standard deviation describes how spread out the individual measurements are. The standard error describes how much the sample mean would change from one sample to another. The SE is the SD divided by the square root of n, so it shrinks as the sample gets bigger while the SD does not."
},
{
"q": "Why does the sample variance divide by n minus 1?",
"a": "It divides by n minus 1 because the deviations are measured from the sample mean, which is calculated from the same data. The sample mean sits closer to its own data than the true mean does, so dividing by n would make the spread look too small. Dividing by n minus 1 corrects that."
},
{
"q": "Is an Apgar score interval or categorical data?",
"a": "An Apgar score is categorical ordinal data. The scores have an order, but the steps between them are not equal measured amounts, so they are ordered categories rather than interval numbers."
}
],
"memorize": [
{
"title": "Find a percentile in a small sample",
"when": "You get a short list of measurements and are asked for a percentile, the median or a quartile.",
"steps": [
{
"do": "Sort the data from smallest to largest.",
"why": "This is because a percentile is a position in the ordered list."
},
{
"do": "Find the position of the percentile.",
"why": "This is because the position tells you which value, or which pair of values, to use.",
"tex": "\\text{position}=1+\\frac{p(n-1)}{100}"
},
{
"do": "Split the position into its whole part k and its leftover fraction f.",
"why": "This is because k tells you which two values to use and f tells you how far to go between them.",
"tex": "k=\\lfloor\\text{position}\\rfloor,\\quad f=\\text{position}-k"
},
{
"do": "If the position is a whole number, read that value directly.",
"why": "This is because the percentile then sits exactly on one observation."
},
{
"do": "If the position falls between two values, move from the lower value toward the higher one by the leftover fraction.",
"why": "This is because the percentile sits partway between those two observations.",
"tex": "x_{(k)}+f\\,\\big(x_{(k+1)}-x_{(k)}\\big)"
},
{
"do": "Write the answer with its units.",
"why": "This is because a percentile is a measurement, not a percent."
}
],
"example": {
"source": "Homework 1 Problem 4(i)",
"prompt": "Heights (in) of a random sample of \\(n=10\\) BME freshmen are 65, 69, 59, 64, 62, 67, 68, 62, 64, 65. Find the 75th percentile.",
"table": {
"headers": [
"Rank",
"1",
"2",
"3",
"4",
"5",
"6",
"7",
"8",
"9",
"10"
],
"rows": [
[
"Height (in)",
"59",
"62",
"62",
"64",
"64",
"65",
"65",
"67",
"68",
"69"
]
]
},
"steps": [
{
"say": "The ten heights are put in order from shortest to tallest, so each height now has a rank from 1 to 10.",
"work": [
"65,\\ 69,\\ 59,\\ 64,\\ 62,\\ 67,\\ 68,\\ 62,\\ 64,\\ 65",
"x_{(1)},\\dots,x_{(10)}\\;=\\;59,\\ 62,\\ 62,\\ 64,\\ 64,\\ 65,\\ 65,\\ 67,\\ 68,\\ 69"
]
},
{
"say": "With p of 75 and n of 10, the 75th percentile sits at position 7.75 in the ordered list.",
"work": [
"\\text{position}=1+\\frac{p(n-1)}{100}",
"\\text{position}=1+\\frac{75(10-1)}{100}",
"\\text{position}=1+6.75=7.75"
]
},
{
"say": "The whole part is 7 and the leftover is 0.75, so the answer lies three quarters of the way from the 7th value to the 8th value.",
"work": [
"k=\\lfloor 7.75\\rfloor=7",
"f=7.75-7=0.75"
]
},
{
"say": "The position 7.75 is not a whole number, so no single height can be read off directly and the next step is needed.",
"work": []
},
{
"say": "The 7th value is 65 and the 8th value is 67, so the percentile is 65 plus three quarters of the 2 inch gap.",
"work": [
"x_{(k)}+f\\,\\big(x_{(k+1)}-x_{(k)}\\big)",
"x_{(7)}+0.75\\,\\big(x_{(8)}-x_{(7)}\\big)=65+0.75\\,(67-65)",
"=65+1.5=66.5"
]
},
{
"say": "The 75th percentile of the freshman heights is 66.5 inches, so about three quarters of the sample is shorter than 66.5 inches.",
"work": [
"x_{75}=66.5\\ \\text{in}"
]
}
]
}
},
{
"title": "Standard error from one sample",
"when": "The question asks how precise a sample mean is.",
"steps": [
{
"do": "Calculate the sample mean and the sample SD.",
"why": "This is because the SE is built from the SD.",
"tex": "s=\\sqrt{\\frac{\\sum (x_i-\\bar x)^2}{n-1}}"
},
{
"do": "Divide the SD by the square root of the sample size.",
"why": "This is because averaging n values shrinks the spread of the mean by that amount.",
"tex": "s_{\\bar x}=\\frac{s}{\\sqrt n}"
},
{
"do": "Say that the SE describes the mean, not individual people.",
"why": "This is because that is the difference most questions are checking."
}
],
"example": {
"source": "Homework 1 Problem 4(i)",
"prompt": "For the same freshman heights (65, 69, 59, 64, 62, 67, 68, 62, 64, 65 in, \\(n=10\\)), find the standard error of the mean.",
"steps": [
{
"say": "The ten heights add to 645 inches, so the mean is 64.5 inches. The squared distances from 64.5 add to 82.5, so the SD is 3.028 inches.",
"work": [
"\\bar x=\\frac{\\sum x_i}{n}=\\frac{645}{10}=64.5\\ \\text{in}",
"s=\\sqrt{\\frac{\\sum (x_i-\\bar x)^2}{n-1}}",
"\\sum (x_i-\\bar x)^2=(65-64.5)^2+(69-64.5)^2+\\dots+(65-64.5)^2=82.5",
"s^2=\\frac{82.5}{10-1}=9.167\\ \\text{in}^2,\\quad s=\\sqrt{9.167}=3.028\\ \\text{in}"
]
},
{
"say": "Dividing the SD by the square root of 10 gives an SE of 0.9574 inches.",
"work": [
"s_{\\bar x}=\\frac{s}{\\sqrt n}",
"s_{\\bar x}=\\frac{3.028}{\\sqrt{10}}=\\frac{3.028}{3.162}",
"s_{\\bar x}=0.9574\\ \\text{in}"
]
},
{
"say": "The SE of 0.9574 inches is the typical error when 64.5 inches is used to estimate the population mean. Individual freshmen still spread about 3.028 inches around the mean, because that is the SD.",
"work": []
}
]
}
},
{
"title": "Check whether data look Normal using percentiles",
"when": "The question asks whether a sample looks Normally distributed.",
"steps": [
{
"do": "Compare the mean with the median.",
"why": "This is because a Normal distribution has them in the same place."
},
{
"do": "Compare the 16th percentile with the mean minus one SD, and the 84th percentile with the mean plus one SD.",
"why": "This is because in a Normal distribution about 16 percent of values fall below one SD under the mean.",
"tex": "x_{16}\\approx \\bar x-s,\\quad x_{84}\\approx \\bar x+s"
},
{
"do": "Find those percentiles with the course position rule.",
"why": "This is because the course defines percentiles by position 1 plus p times (n minus 1) over 100."
},
{
"do": "State a cautious conclusion about whether the data look Normal.",
"why": "This is because a small sample can only suggest the shape, not prove it."
}
],
"example": {
"source": "Homework 1 Problem 4(v)",
"prompt": "Heights (in) of a random sample of \\(n=10\\) BME seniors are 69, 66, 70, 71, 72, 67, 70, 71, 72, 69. Does the senior population seem to be Normally distributed? Show how you came to this conclusion.",
"table": {
"headers": [
"Rank",
"1",
"2",
"3",
"4",
"5",
"6",
"7",
"8",
"9",
"10"
],
"rows": [
[
"Height (in)",
"66",
"67",
"69",
"69",
"70",
"70",
"71",
"71",
"72",
"72"
]
]
},
"steps": [
{
"say": "The mean is 69.7 inches and the median is 70 inches. They are only 0.3 inches apart, so the center looks like a Normal center.",
"work": [
"\\bar x=\\frac{697}{10}=69.7\\ \\text{in}",
"\\text{median}=\\frac{x_{(5)}+x_{(6)}}{2}=\\frac{70+70}{2}=70\\ \\text{in}"
]
},
{
"say": "The SD is 2.003 inches, so a Normal shape would put the 16th percentile near 67.70 inches and the 84th percentile near 71.70 inches.",
"work": [
"\\sum (x_i-\\bar x)^2=(66-69.7)^2+(67-69.7)^2+\\dots+(72-69.7)^2=36.1",
"s=\\sqrt{\\frac{36.1}{10-1}}=\\sqrt{4.011}=2.003\\ \\text{in}",
"x_{16}\\approx \\bar x-s=69.7-2.003=67.70\\ \\text{in}",
"x_{84}\\approx \\bar x+s=69.7+2.003=71.70\\ \\text{in}"
]
},
{
"say": "From the ordered heights the 16th percentile is 67.88 inches and the 84th percentile is 71.56 inches.",
"work": [
"\\text{position}_{16}=1+\\frac{16(10-1)}{100}=2.44,\\quad k=2,\\ f=0.44",
"x_{16}=x_{(2)}+0.44\\,\\big(x_{(3)}-x_{(2)}\\big)=67+0.44\\,(69-67)=67.88\\ \\text{in}",
"\\text{position}_{84}=1+\\frac{84(10-1)}{100}=8.56,\\quad k=8,\\ f=0.56",
"x_{84}=x_{(8)}+0.56\\,\\big(x_{(9)}-x_{(8)}\\big)=71+0.56\\,(72-71)=71.56\\ \\text{in}"
]
},
{
"say": "The mean is close to the median, and both percentiles land within 0.2 inches of the Normal targets. So the senior heights may come from a Normal population, but 10 values can only suggest this.",
"work": [
"67.88\\approx 67.70,\\qquad 71.56\\approx 71.70"
]
}
]
}
}
]
},
{
"id": 3,
"tier": "asked",
"title": "Discrete random variables",
"lead": "A discrete random variable takes separate values, and each value has its own probability.",
"topics": [
{
"title": "What a random variable is",
"blocks": [
{
"pages": [
5,
6,
8,
9,
11
],
"main": "**A random variable turns each outcome of an experiment into a number.** The **sample space** is the list of every possible outcome. When a coin is coded as 1 for heads and 0 for tails, the outcome becomes a number you can add and average.",
"sub": [
"A **discrete** random variable has separate values you can list, like the number of heads in three tosses."
],
"end": "So a random variable lets you do arithmetic with chance outcomes."
},
{
"pages": [
13,
14,
15,
16
],
"main": "**Independent events do not change each other's chances, so their probabilities multiply.** After a run of heads, the next toss is still one half, because the coin has no memory. When an earlier event does change the next chance, you multiply by the **conditional probability** instead."
}
]
},
{
"title": "The probability function and its rules",
"blocks": [
{
"pages": [
17,
20,
22,
23
],
"main": "**The probability function, written f of y, gives the chance of each exact value.** Every probability must be between 0 and 1, and all of them must add up to exactly 1. A function that breaks either rule cannot be a probability function.",
"sub": [
"The function must be defined for every value of y, so you always finish it with \"0 elsewhere\"."
],
"end": "So checking a probability function means checking the range of each value and the total."
}
]
},
{
"title": "The cumulative distribution function",
"blocks": [
{
"pages": [
24,
25
],
"main": "**The cumulative distribution function, F of y, adds up all the probability at or below y.** Its graph is a staircase. It is flat between the possible values and jumps up at each one. The size of each jump is the probability of that exact value.",
"sub": [
"The filled dot at a jump shows that F includes the value itself, because F means less than or equal to.",
"F starts at 0 on the far left and ends at 1 on the far right."
],
"end": "That is why you can rebuild the probability function by reading the jump sizes."
}
]
},
{
"title": "Expected value and variance",
"blocks": [
{
"pages": [
26,
27,
28,
29
],
"main": "**The expected value is a weighted average, where each value is weighted by its probability.** It is the long-run average if the experiment were repeated many times. It does not have to be a value the variable can actually take.",
"sub": [
"The **variance** is the weighted average of the squared distances from the expected value, so it measures spread."
],
"end": "So both the mean and the variance come from multiplying by the probabilities and adding."
},
{
"pages": [
30,
31
],
"main": "**In a game, the expected earnings include the losing outcomes as negative numbers.** Roulette has an expected value below zero, so a player loses money on average over many bets."
}
]
}
],
"questions": [
{
"q": "How do you write the probability function from a graph of the CDF?",
"a": "Each jump in the CDF graph sits at a possible value, and the height of the jump is the probability of that value. So you list each jump location with its jump size, and you finish with 0 elsewhere. The probabilities should add up to 1."
},
{
"q": "Why is the probability that Y is greater than a equal to 1 minus F of a?",
"a": "F of a is the probability that Y is less than or equal to a. Being greater than a is everything else, so its probability is 1 minus F of a."
},
{
"q": "Can the expected value be a value the variable can never take?",
"a": "Yes, the expected value can be a value the variable never takes. This is because it is a weighted average of all the values, like 3.5 for a fair die, and an average can fall between possible outcomes."
}
],
"memorize": [
{
"title": "Check whether a function is a valid probability function",
"when": "The question lists functions and asks which could be probability functions.",
"steps": [
{
"do": "Check that every value of f is between 0 and 1.",
"why": "This is because a probability can never be negative or above 1."
},
{
"do": "Add all the values and show the sum.",
"why": "This is because the probabilities must total exactly 1.",
"tex": "\\sum_y f(y)=1"
},
{
"do": "Name the rule that fails for any function that is not valid.",
"why": "This is because the answer must say why it is not a probability function."
}
],
"example": {
"source": "Homework 1 Problem 2(a)",
"prompt": "Which of these functions could be probability functions of a discrete random variable \\(X\\)? Each is 0 elsewhere.",
"table": {
"headers": [
"Function",
"Values of x",
"f(x)"
],
"rows": [
[
"f2",
"0, 3, 4, 5, 8, 10",
"0.2, 0, 0.4, 0.2, 0.2, 0.1"
],
[
"f3",
"-2, 1, 3, 4.5, 7",
"0.3, 0.3, -0.1, 0.1, 0.4"
],
[
"f4",
"0.5, 1, 2",
"0.4, 0.1, 0.4"
],
[
"f5",
"1, 2, 3",
"1/6, 2/6, 1/2"
]
]
},
"steps": [
{
"say": "Every value of f2, f4 and f5 is between 0 and 1. The function f3 gives a negative value at x of 3, so f3 already fails.",
"work": [
"0\\le f(x_i)\\le 1\\ \\text{for all } x_i",
"f_3(3)=-0.1<0"
]
},
{
"say": "The sums are 1.1 for f2, 1.0 for f3, 0.9 for f4 and 1 for f5. So f3 adds to 1 even though one of its values is negative.",
"work": [
"\\sum_{i=1}^{k} f(x_i)=1",
"f_2\\!:\\ 0.2+0+0.4+0.2+0.2+0.1=1.1",
"f_3\\!:\\ 0.3+0.3+(-0.1)+0.1+0.4=1.0",
"f_4\\!:\\ 0.4+0.1+0.4=0.9",
"f_5\\!:\\ \\tfrac{1}{6}+\\tfrac{2}{6}+\\tfrac{1}{2}=1"
]
},
{
"say": "Only f5 is a probability function. f2 breaks the sum rule because it totals 1.1, f4 breaks it because it totals 0.9, and f3 breaks the rule that no probability is negative.",
"work": [
"f_2,\\ f_4\\!:\\ \\sum f(x_i)\\ne 1,\\qquad f_3\\!:\\ f(3)<0"
]
}
]
}
},
{
"title": "Turn a CDF graph into a probability function",
"when": "You see a staircase graph of F of y and must write f of y for all values.",
"steps": [
{
"do": "Find every place where the staircase jumps.",
"why": "This is because the variable can only take the values where F jumps."
},
{
"do": "Measure each jump as the upper height minus the lower height.",
"why": "This is because the jump size is the probability of that exact value.",
"tex": "f(y_k)=F(y_k)-F(y_{k-1})"
},
{
"do": "Write each value with its probability in a piecewise function.",
"why": "This is because the question asks you to define f of y completely."
},
{
"do": "Finish with 0 elsewhere.",
"why": "This is because every other value has no probability."
},
{
"do": "Check that the probabilities add up to 1.",
"why": "This is because a valid probability function always totals 1."
}
],
"example": {
"source": "Exam 1 Question 1(i)",
"prompt": "The d.f. \\(F(y)\\) of the discrete random variable \\(Y\\) is a staircase. It is 0 for \\(y<-2\\), \\(\\tfrac{1}{3}\\) for \\(-2\\le y<1\\), \\(\\tfrac{1}{2}\\) for \\(1\\le y<3\\) and 1 for \\(y\\ge 3\\). Write \\(f(y)\\) for all values of \\(y\\).",
"steps": [
{
"say": "The staircase jumps at y of minus 2, at y of 1 and at y of 3, so those are the only values Y can take.",
"work": [
"\\text{jumps at } y=-2,\\ 1,\\ 3"
]
},
{
"say": "Each jump is the new height minus the old height, so the jumps are one third, one sixth and one half.",
"work": [
"f(y_k)=F(y_k)-F(y_{k-1})",
"f(-2)=\\tfrac{1}{3}-0=\\tfrac{1}{3}",
"f(1)=\\tfrac{1}{2}-\\tfrac{1}{3}=\\tfrac{1}{6}",
"f(3)=1-\\tfrac{1}{2}=\\tfrac{1}{2}"
]
},
{
"say": "Each value is written next to its jump size.",
"work": [
"f(y)=\\tfrac{1}{3} \\text{ for } y=-2,\\quad \\tfrac{1}{6} \\text{ for } y=1,\\quad \\tfrac{1}{2} \\text{ for } y=3"
]
},
{
"say": "Every other value of y gets probability 0, so the function is now defined for all y.",
"work": [
"f(y)=\\begin{cases}\\tfrac{1}{3} & y=-2\\\\[2pt] \\tfrac{1}{6} & y=1\\\\[2pt] \\tfrac{1}{2} & y=3\\\\[2pt] 0 & \\text{elsewhere}\\end{cases}"
]
},
{
"say": "The three probabilities add to 1, so f is a valid probability function.",
"work": [
"\\tfrac{1}{3}+\\tfrac{1}{6}+\\tfrac{1}{2}=\\tfrac{2}{6}+\\tfrac{1}{6}+\\tfrac{3}{6}=1"
]
}
]
}
},
{
"title": "Read a probability from the CDF",
"when": "You are asked for a chance like Y greater than a value, or Y between two values.",
"steps": [
{
"do": "Rewrite the question using less than or equal to.",
"why": "This is because F only gives less than or equal to probabilities."
},
{
"do": "For a right tail, subtract F at the cutoff from 1.",
"why": "This is because the right tail is everything F does not include.",
"tex": "P(Y>a)=1-F(a)"
},
{
"do": "For an interval, subtract F at the lower end from F at the upper end.",
"why": "This is because that leaves only the probability between the two ends.",
"tex": "P(a<Y\\le b)=F(b)-F(a)"
},
{
"do": "Check whether each endpoint is included.",
"why": "This is because a discrete variable can sit exactly on an endpoint, and strict or not strict changes the answer."
}
],
"example": {
"source": "Exam 1 Question 1(ii) and (iii)",
"prompt": "For the same \\(Y\\) (jumps of \\(\\tfrac{1}{3}\\) at \\(-2\\), \\(\\tfrac{1}{6}\\) at 1 and \\(\\tfrac{1}{2}\\) at 3), find (ii) \\(P(Y>-1)\\) and (iii) \\(P(-0.5<Y<2.25)\\).",
"steps": [
{
"say": "Both questions are rewritten with less than or equal to, so they can be read from F.",
"work": [
"P(Y>-1)=1-P(Y\\le -1)",
"P(-0.5<Y<2.25)=P(Y\\le 2.25)-P(Y\\le -0.5)"
]
},
{
"say": "F at minus 1 is one third because only the jump at minus 2 has been collected, so the right tail is two thirds.",
"work": [
"P(Y>a)=1-F(a)",
"P(Y>-1)=1-F(-1)=1-\\tfrac{1}{3}=\\tfrac{2}{3}"
]
},
{
"say": "F at 2.25 is one half and F at minus 0.5 is one third, so the interval holds one sixth.",
"work": [
"P(a<Y\\le b)=F(b)-F(a)",
"P(-0.5<Y<2.25)=F(2.25)-F(-0.5)=\\tfrac{1}{2}-\\tfrac{1}{3}=\\tfrac{1}{6}"
]
},
{
"say": "None of minus 1, minus 0.5 or 2.25 is a value Y can take, so strict or not strict gives the same answer here. Adding the jumps at 1 and 3 confirms two thirds.",
"work": [
"P(Y>-1)=f(1)+f(3)=\\tfrac{1}{6}+\\tfrac{1}{2}=\\tfrac{2}{3}",
"P(-0.5<Y<2.25)=f(1)=\\tfrac{1}{6}"
]
}
]
}
},
{
"title": "Expected value and variance of a discrete variable",
"when": "You have a table or function of values and probabilities.",
"steps": [
{
"do": "List each value next to its probability.",
"why": "This is because every calculation pairs a value with its weight."
},
{
"do": "Multiply each value by its probability and add.",
"why": "This is because the expected value is a weighted average.",
"tex": "E[X]=\\sum x\\,f(x)"
},
{
"do": "Square each distance from the mean, multiply by its probability, and add.",
"why": "This is because variance is the weighted average squared distance.",
"tex": "\\operatorname{Var}(X)=\\sum (x-\\mu)^2 f(x)=E[X^2]-(E[X])^2"
},
{
"do": "Take the square root if the SD is asked.",
"why": "This is because the SD puts the spread back in the original units."
}
],
"example": {
"source": "Homework 1 Problem 2(b)",
"prompt": "\\(f_6(x)=0.55\\) for \\(x=-1\\), 0.15 for \\(x=2\\), 0.1 for \\(x=3\\), 0.2 for \\(x=7\\), and 0 elsewhere. Compute \\(E[X]\\), \\(E[(X-E[X])^2]\\), \\(E[X^2]\\) and \\(E[X^2]-(E[X])^2\\).",
"table": {
"headers": [
"x",
"-1",
"2",
"3",
"7"
],
"rows": [
[
"f(x)",
"0.55",
"0.15",
"0.1",
"0.2"
]
]
},
"steps": [
{
"say": "The four values are paired with their probabilities, and the probabilities add to 1.",
"work": [
"0.55+0.15+0.1+0.2=1"
]
},
{
"say": "Each value times its probability gives minus 0.55, 0.3, 0.3 and 1.4, so the expected value is 1.45.",
"work": [
"E[X]=\\sum x\\,f(x)",
"E[X]=(-1)(0.55)+(2)(0.15)+(3)(0.1)+(7)(0.2)",
"E[X]=-0.55+0.3+0.3+1.4=1.45"
]
},
{
"say": "The weighted squared distances from 1.45 add to 9.7475. The shortcut with E of X squared, which is 11.85, gives the same variance.",
"work": [
"\\operatorname{Var}(X)=\\sum (x-\\mu)^2 f(x)",
"=(-1-1.45)^2(0.55)+(2-1.45)^2(0.15)+(3-1.45)^2(0.1)+(7-1.45)^2(0.2)",
"=3.301+0.04538+0.2403+6.161=9.7475",
"E[X^2]=(-1)^2(0.55)+(2)^2(0.15)+(3)^2(0.1)+(7)^2(0.2)=11.85",
"E[X^2]-(E[X])^2=11.85-(1.45)^2=11.85-2.1025=9.7475"
]
},
{
"say": "The SD is the square root of 9.7475, so X spreads about 3.122 units around its mean of 1.45.",
"work": [
"\\sigma=\\sqrt{9.7475}=3.122"
]
}
]
}
}
]
},
{
"id": 4,
"tier": "asked",
"title": "Continuous random variables",
"lead": "A continuous variable can take any value in a range, so probability is measured as area under a curve.",
"topics": [
{
"title": "Density and area",
"blocks": [
{
"pages": [
5,
6,
7
],
"main": "**For a continuous variable, probability is the area under the density curve.** The density, written f of x, is not itself a probability. The chance of landing between two values is the area under f between them, and the total area must be 1.",
"sub": [
"The chance of one exact value is zero, because a single point has no width and so no area.",
"That is why less than and less than or equal to give the same answer for a continuous variable."
],
"end": "So every continuous probability question is an area question."
}
]
},
{
"title": "Building the CDF piece by piece",
"blocks": [
{
"pages": [
10,
11,
12,
13
],
"main": "**The CDF of a continuous variable adds up the area from the far left up to x.** When the density has separate pieces, the CDF has matching pieces. Below the range the CDF is 0. Inside the range it is the area so far. Above the range it is 1.",
"sub": [
"Inside a piece, you add the area already collected before that piece to the integral from the start of the piece up to x.",
"The pieces must join without gaps, because area cannot suddenly appear or disappear."
],
"end": "So the CDF climbs smoothly from 0 to 1 and then stays at 1."
},
{
"pages": [
14
],
"main": "**Left tails, right tails and intervals all come from the CDF.** A left tail is F at the cutoff. A right tail is 1 minus F at the cutoff. An interval is F at the upper end minus F at the lower end."
}
]
},
{
"title": "Expected value of a continuous variable",
"blocks": [
{
"pages": [
15,
16,
17,
18,
19
],
"main": "**The expected value of a continuous variable is the integral of x times the density.** It plays the same role as the weighted sum for a discrete variable, with area replacing the list of probabilities. For a Uniform variable, the mean is the midpoint because the density is flat.",
"sub": [
"If every value is rescaled by a and shifted by b, the mean is rescaled and shifted the same way.",
"A shift does not change the variance, but rescaling by a multiplies the variance by a squared."
],
"end": "So you can often find a new mean from an old one without integrating again."
}
]
}
],
"questions": [
{
"q": "Why is the probability of one exact value zero for a continuous variable?",
"a": "The probability of one exact value is zero because probability is area under the density. A single point has no width, so the area above it is zero."
},
{
"q": "What must be true for a function to be a valid density?",
"a": "The function must never be negative, and its total area must equal 1. If a constant is unknown, you set the total area equal to 1 and solve for it."
},
{
"q": "What does the CDF look like above the largest possible value?",
"a": "The CDF equals 1 above the largest possible value and stays there. This is because all of the area has already been collected, so nothing is left to add."
}
],
"memorize": [
{
"title": "Write the full CDF from a piecewise density",
"when": "You are given f of x in pieces and asked for F of x for all x.",
"steps": [
{
"do": "Write the definition of F as the integral of f from the far left up to x.",
"why": "This is because the CDF is accumulated area.",
"tex": "F(x)=\\int_{-\\infty}^{x} f(u)\\,du"
},
{
"do": "Below the range, write F as 0.",
"why": "This is because no area has been collected yet."
},
{
"do": "Inside the range, add the area so far to the integral from the start of the piece up to x.",
"why": "This is because each piece builds on the area before it.",
"tex": "F(x)=F(a)+\\int_{a}^{x} f(u)\\,du"
},
{
"do": "Above the range, write F as 1.",
"why": "This is because all the area has been collected."
},
{
"do": "Check that the pieces meet at each boundary.",
"why": "This is because the CDF of a continuous variable has no jumps."
}
],
"example": {
"source": "Exam 1 Question 2(ii)",
"prompt": "The p.d.f. of \\(X\\) is \\(f(x)=0\\) for \\(x\\le 0\\), \\(f(x)=\\tfrac{1}{8} x\\) for \\(0<x\\le 4\\), and \\(f(x)=0\\) for \\(x>4\\). Write \\(F(x)\\) for all values of \\(x\\).",
"steps": [
{
"say": "The CDF is the area under f from the far left up to x.",
"work": [
"F(x)=\\int_{-\\infty}^{x} f(u)\\,du"
]
},
{
"say": "For x at or below 0 the density is 0, so no area has been collected.",
"work": [
"x\\le 0\\!:\\quad F(x)=\\int_{-\\infty}^{x} 0\\,du=0"
]
},
{
"say": "For x between 0 and 4 the area so far is F of 0, which is 0, plus the area under u over 8 from 0 to x. That gives x squared over 16.",
"work": [
"F(x)=F(a)+\\int_{a}^{x} f(u)\\,du",
"0<x\\le 4\\!:\\quad F(x)=F(0)+\\int_0^x \\tfrac{1}{8} u\\,du=0+\\tfrac{1}{16}u^2\\Big|_0^x=\\tfrac{1}{16}x^2"
]
},
{
"say": "Past 4 the density is 0 again, so F stays at F of 4, which is 1.",
"work": [
"x>4\\!:\\quad F(x)=F(4)+\\int_4^x 0\\,du=1+0=1"
]
},
{
"say": "At 0 the middle piece gives 0 and at 4 it gives 1, so the pieces meet with no jump.",
"work": [
"\\tfrac{1}{16}(0)^2=0,\\qquad \\tfrac{1}{16}(4)^2=\\tfrac{16}{16}=1",
"F(x)=\\begin{cases}0 & x\\le 0\\\\[2pt] \\tfrac{1}{16}x^2 & 0<x\\le 4\\\\[2pt] 1 & x>4\\end{cases}"
]
}
]
}
},
{
"title": "Percentile or median of a continuous variable",
"when": "The question gives a density or CDF and asks for a percentile, like the 75th percentile on Exam 1.",
"steps": [
{
"do": "Write the full CDF first.",
"why": "This is because a percentile is found by reading the CDF backward."
},
{
"do": "Find which piece of the CDF reaches the target value.",
"why": "This is because only one piece can contain the percentile."
},
{
"do": "Set that piece equal to the percent as a decimal.",
"why": "This is because the pth percentile c is where the accumulated area is p over 100.",
"tex": "F(c)=\\frac{p}{100}"
},
{
"do": "Solve for c and keep the root inside that piece's range.",
"why": "This is because a root outside the range does not belong to this variable."
}
],
"example": {
"source": "Exam 1 Question 2(iii)",
"prompt": "For the same \\(X\\) with \\(f(x)=\\tfrac{1}{8} x\\) on \\(0<x\\le 4\\), what is the 75th percentile of \\(X\\)?",
"steps": [
{
"say": "The CDF from the density is written out first.",
"work": [
"F(x)=\\begin{cases}0 & x\\le 0\\\\[2pt] \\tfrac{1}{16}x^2 & 0<x\\le 4\\\\[2pt] 1 & x>4\\end{cases}"
]
},
{
"say": "F rises from 0 at x of 0 to 1 at x of 4, so 0.75 is reached inside the middle piece.",
"work": [
"F(0)=0<0.75<1=F(4)"
]
},
{
"say": "The middle piece is set equal to three quarters.",
"work": [
"F(c)=\\frac{p}{100}",
"F(c)=\\tfrac{1}{16}c^2=\\tfrac{3}{4}"
]
},
{
"say": "Solving gives c squared of 12, so c is 2 root 3, about 3.464. The negative root is dropped because it is outside 0 to 4.",
"work": [
"c^2=\\frac{16\\cdot 3}{4}=12",
"c=\\pm\\sqrt{12}=\\pm 3.464",
"c=2\\sqrt3\\approx 3.464"
]
}
]
}
},
{
"title": "Expected value from a density",
"when": "You are asked for E of X when X is continuous.",
"steps": [
{
"do": "Write E of X as the integral of x times f of x.",
"why": "This is because every value is weighted by its density.",
"tex": "E[X]=\\int_{-\\infty}^{\\infty} x\\,f(x)\\,dx"
},
{
"do": "Split the integral over every piece, write the zero pieces, then drop them.",
"why": "This is because the solutions show every piece before keeping only the range where f is not zero."
},
{
"do": "Integrate and plug in the upper bound minus the lower bound.",
"why": "This is because a definite integral is the difference between the two ends."
}
],
"example": {
"source": "Exam 1 Question 2(i)",
"prompt": "For the same \\(X\\) with \\(f(x)=\\tfrac{1}{8} x\\) on \\(0<x\\le 4\\), what is \\(E[X]\\)?",
"steps": [
{
"say": "E of X weights each x by its density.",
"work": [
"E[X]=\\int_{-\\infty}^{\\infty} x\\,f(x)\\,dx"
]
},
{
"say": "The integral splits into three pieces. The two outer pieces are 0, so only 0 to 4 is kept.",
"work": [
"E[X]=\\int_{-\\infty}^{0} x\\cdot 0\\,dx+\\int_0^4 x\\left(\\tfrac{1}{8} x\\right)dx+\\int_4^{\\infty} x\\cdot 0\\,dx",
"E[X]=\\tfrac{1}{8}\\int_0^4 x^2\\,dx"
]
},
{
"say": "The antiderivative is x cubed over 24, so the answer is 64 over 24, which is 8 thirds.",
"work": [
"E[X]=\\tfrac{1}{24}x^3\\Big|_0^4=\\tfrac{1}{24}\\big(4^3-0^3\\big)=\\tfrac{64}{24}",
"E[X]=\\tfrac{8}{3}\\approx 2.667"
]
}
]
}
},
{
"title": "Find an unknown constant in a density",
"when": "The density contains a letter like c that you must find.",
"steps": [
{
"do": "Set the total area under f equal to 1.",
"why": "This is because every valid density has total area 1.",
"tex": "\\int f(x)\\,dx=1"
},
{
"do": "Integrate and solve for the constant.",
"why": "This is because that is the only value that makes the total come out to 1."
},
{
"do": "Keep only the solution that makes sense.",
"why": "This is because a range endpoint or density value cannot be negative."
}
],
"example": {
"source": "Homework 1 Problem 3(a)(i)",
"prompt": "The p.d.f. of \\(X\\) is \\(f(x)=0\\) for \\(x\\le 0\\), \\(f(x)=0.1+x\\) for \\(0<x\\le c\\), and \\(f(x)=0\\) for \\(c<x\\). Find \\(c\\).",
"steps": [
{
"say": "The density is only nonzero from 0 to c, so the area over that range must be 1.",
"work": [
"\\int_{-\\infty}^{\\infty} f(x)\\,dx=1",
"\\int_0^c (0.1+x)\\,dx=1"
]
},
{
"say": "Integrating gives 0.1c plus c squared over 2. Setting that to 1 gives a quadratic with roots 1.3177 and minus 1.5177.",
"work": [
"\\left[0.1x+\\tfrac{1}{2} x^2\\right]_0^c=0.1c+\\tfrac{1}{2} c^2=1",
"c^2+0.2c-2=0",
"c=\\frac{-0.2\\pm\\sqrt{0.2^2+4(2)}}{2}=\\frac{-0.2\\pm\\sqrt{8.04}}{2}=\\frac{-0.2\\pm 2.8355}{2}",
"c=1.3177\\quad\\text{or}\\quad c=-1.5177"
]
},
{
"say": "The range 0 to c needs c above 0, so the negative root is dropped and c is 1.3177.",
"work": [
"c=1.3177"
]
}
]
}
}
]
},
{
"id": 5,
"tier": "asked",
"title": "Normal probabilities and percentiles",
"lead": "Every Normal question is turned into the standard Normal so that one table can answer it.",
"topics": [
{
"title": "The standard Normal and its table",
"blocks": [
{
"pages": [
6,
7,
8
],
"main": "**The standard Normal, written Z, has mean 0 and SD 1, and its table gives the area to the left of z.** A right tail is 1 minus that left area. An interval is the left area at the upper end minus the left area at the lower end.",
"sub": [
"Because the curve is symmetric, the area to the left of negative z equals the area to the right of positive z."
],
"end": "So drawing the area first tells you which subtraction to do."
}
]
},
{
"title": "Standardizing any Normal measurement",
"blocks": [
{
"pages": [
10,
11,
12
],
"main": "**Standardizing turns a measurement into the number of SDs it sits from the mean.** You subtract the mean and divide by the SD. The probability stays the same, because the whole curve is just shifted and stretched.",
"end": "So a question about any Normal variable becomes a question about Z."
},
{
"pages": [
9
],
"main": "**A quantile reverses the question, because it starts from an area and asks for the value.** You find the z with that left area in the table, then turn it back into the original units by multiplying by the SD and adding the mean."
}
]
},
{
"title": "Probabilities for a sample mean",
"blocks": [
{
"pages": [
14
],
"main": "**A question about the average of a sample uses the standard error instead of the SD.** The sample mean is Normal with the same mean as the population, but its SD is the population SD divided by the square root of n. So the same value is many more SEs from the mean than SDs, and the probabilities change a lot.",
"end": "That is why you must check whether the question is about one person or about an average."
}
]
},
{
"title": "Checking whether data look Normal",
"blocks": [
{
"pages": [
15,
16,
17
],
"main": "**A Normal quantile plot should look like a straight line when the data are Normal.** Each sorted value is plotted against where it would fall on a Normal curve. Curves or bends at the ends mean skewness or heavy tails."
}
]
}
],
"questions": [
{
"q": "Why do you standardize before using the table?",
"a": "You standardize because the table only describes the standard Normal. Subtracting the mean and dividing by the SD turns any Normal value into a z value, and the probability stays the same."
},
{
"q": "How does a question about the mean of 16 people differ from a question about one person?",
"a": "For the mean of 16 people you divide the SD by the square root of 16 first. This is because averages vary less than single people. The smaller spread puts the same cutoff more SEs away, so the probability changes."
},
{
"q": "What does a bend at the end of a Normal quantile plot tell you?",
"a": "A bend at the end tells you the data are not Normal in that tail. The extreme values are farther out or closer in than a Normal curve would put them, so the data are skewed or have heavy tails."
}
],
"memorize": [
{
"title": "Normal probability for one measurement",
"when": "A variable is Normal with a given mean and SD, and you want a probability.",
"steps": [
{
"do": "Write the variable as Normal with its mean and SD.",
"why": "This is because it names the numbers you will use."
},
{
"do": "Standardize each cutoff.",
"why": "This is because the table only works for Z.",
"tex": "z=\\frac{x-\\mu}{\\sigma}"
},
{
"do": "Sketch the area you want.",
"why": "This is because the sketch tells you whether to use the left area, 1 minus it, or a difference."
},
{
"do": "Look up each left area in the table and combine them, using symmetry for a negative z.",
"why": "This is because the table only lists left areas for positive z.",
"tex": "P(a<X<b)=F(z_b)-F(z_a),\\quad F(-z)=1-F(z)",
"table": "Use the class z table. It lists z beside F(z), the area to the left of z, and only for positive z.",
"tablePath": "sources/tables/z_table_NormalDist.pdf"
},
{
"do": "State the probability in words about the original variable.",
"why": "This is because the question is about the measurement, not about Z."
}
],
"example": {
"source": "Homework 1 Problem 3(b)(ii)",
"prompt": "Fasting blood glucose in healthy U.S. adults aged 30 to 50 is Normal with mean 95 mg/dL and SD 8.7 mg/dL, \\(X\\sim N(95,8.7^2)\\). Find \\(P(85\\le X<115)\\).",
"steps": [
{
"say": "X is fasting glucose, Normal with mean 95 mg/dL and SD 8.7 mg/dL.",
"work": [
"X\\sim N(\\mu,\\sigma^2)=N(95,\\ 8.7^2)\\ \\text{mg/dL}"
]
},
{
"say": "The cutoff 85 sits 1.149 SDs below the mean and 115 sits 2.299 SDs above it. The table rows nearest these are 1.15 and 2.30.",
"work": [
"z=\\frac{x-\\mu}{\\sigma}",
"z_{85}=\\frac{85-95}{8.7}=-1.149\\approx -1.15",
"z_{115}=\\frac{115-95}{8.7}=2.299\\approx 2.30"
]
},
{
"say": "The wanted area is the middle band between the two cutoffs, so it is the left area at 2.30 minus the left area at minus 1.15.",
"work": [
"P(85\\le X<115)=P(-1.15\\le Z<2.30)"
]
},
{
"say": "The table gives 0.9893 at 2.30 and 0.8749 at 1.15. Symmetry turns the negative cutoff into 0.1251, so the band holds 0.8642.",
"work": [
"P(a<X<b)=F(z_b)-F(z_a),\\quad F(-z)=1-F(z)",
"F(2.30)=0.9893,\\qquad F(-1.15)=1-F(1.15)=1-0.8749=0.1251",
"P(85\\le X<115)=0.9893-0.1251=0.8642"
]
},
{
"say": "About 86.4 percent of healthy adults aged 30 to 50 have fasting glucose from 85 up to 115 mg/dL.",
"work": [
"P(85\\le X<115)\\approx 0.864"
]
}
]
}
},
{
"title": "Normal probability for a sample mean",
"when": "The question asks about the average of a sample of n people.",
"steps": [
{
"do": "Name the sample mean as a new Normal variable with the same mean, by the central limit theorem.",
"why": "This is because averages center on the population mean and are Normal."
},
{
"do": "Divide the SD by the square root of n.",
"why": "This is because averages vary less than individuals.",
"tex": "\\sigma_{\\bar X}=\\frac{\\sigma}{\\sqrt n}"
},
{
"do": "Standardize using the SE, not the SD.",
"why": "This is because the SE is the spread of the mean.",
"tex": "z=\\frac{\\bar x-\\mu}{\\sigma/\\sqrt n}"
},
{
"do": "Use the table and combine the areas as before.",
"why": "This is because the rest of the method does not change.",
"table": "Use the class z table. It lists z beside F(z), the area to the left of z, and only for positive z.",
"tablePath": "sources/tables/z_table_NormalDist.pdf"
}
],
"example": {
"source": "Exam 1 Question 3",
"prompt": "BUN in healthy U.S. adults aged 20 to 60 is Normal with mean 18 mg/100mL and SD 6 mg/100mL. What is the probability that the mean BUN in a sample of 16 healthy adults is between 15 and 24 mg/100mL?",
"steps": [
{
"say": "The sample mean of 16 adults is its own random variable. By the central limit theorem it is Normal and centered on the same mean of 18 mg/100mL.",
"work": [
"\\bar X\\sim N\\big(\\mu_{\\bar X},\\sigma_{\\bar X}^2\\big),\\quad \\mu_{\\bar X}=\\mu=18\\ \\text{mg/100mL}"
]
},
{
"say": "The SD of 6 is divided by the square root of 16, so the SE is 1.5 mg/100mL.",
"work": [
"\\sigma_{\\bar X}=\\frac{\\sigma}{\\sqrt n}=\\frac{6}{\\sqrt{16}}=\\frac{6}{4}=1.5\\ \\text{mg/100mL}"
]
},
{
"say": "Measured in SEs, 15 is 2 below the mean and 24 is 4 above it.",
"work": [
"z=\\frac{\\bar x-\\mu}{\\sigma/\\sqrt n}",
"P(15<\\bar X<24)=P\\left(\\frac{15-18}{1.5}<Z<\\frac{24-18}{1.5}\\right)=P(-2<Z<4)"
]
},
{
"say": "The table gives 1.0000 at 4.00 and 0.9773 at 2.00, so the chance the sample mean lands between 15 and 24 is 0.9773.",
"work": [
"P(-2<Z<4)=F(4)-F(-2)=F(4)-\\big(1-F(2)\\big)",
"=1.0000-(1-0.9773)=0.9773"
]
}
]
}
},
{
"title": "Normal percentile",
"when": "You are given an area and asked for the value that cuts it off.",
"steps": [
{
"do": "Turn the request into a left area.",
"why": "This is because the table is organized by left area."
},
{
"do": "Find the z with that left area, using symmetry when the area is below one half.",
"why": "This is because the table only lists areas of one half and above.",
"table": "Use the class z table. It lists z beside F(z), the area to the left of z, and only for positive z.",
"tablePath": "sources/tables/z_table_NormalDist.pdf"
},
{
"do": "Convert back to the original units.",
"why": "This is because the answer must be a measurement.",
"tex": "x=\\mu+z\\,\\sigma"
}
],
"example": {
"source": "Homework 1 Problem 3(b)(ii)",
"prompt": "For fasting blood glucose \\(X\\sim N(95,8.7^2)\\) mg/dL, find the 25th percentile.",
"steps": [
{
"say": "The 25th percentile is the value with 25 percent of the area to its left.",
"work": [
"F(z_{25})=0.25"
]
},
{
"say": "The table starts at one half, so symmetry is used. The left area 0.75 falls between 0.7486 at 0.67 and 0.7517 at 0.68, so z is about 0.675 and the 25th percentile z is minus 0.675.",
"work": [
"F(-z_{25})=1-0.25=0.75",
"F(0.67)=0.7486,\\quad F(0.68)=0.7517\\ \\Rightarrow\\ -z_{25}\\approx 0.675",
"z_{25}=-0.675"
]
},
{
"say": "Going 0.675 SDs below the mean of 95 gives 89.13 mg/dL, so a quarter of these adults fall below about 89.13 mg/dL.",
"work": [
"x=\\mu+z\\,\\sigma",
"x_{25}=95+8.7(-0.675)=95-5.8725=89.1275\\approx 89.13\\ \\text{mg/dL}"
]
}
]
}
}
]
},
{
"id": 6,
"tier": "asked",
"title": "The idea behind ANOVA",
"lead": "ANOVA asks whether several group means differ by comparing two estimates of the same variance.",
"topics": [
{
"title": "The question ANOVA answers",
"blocks": [
{
"pages": [
3,
4,
5
],
"main": "**ANOVA (analysis of variance) tests whether three or more group means differ.** The **null hypothesis** says that the treatment has no effect, so all the groups are samples from one population. Even then, the sample means would differ a little because of random sampling.",
"end": "So the question is whether the means differ more than random sampling alone would explain."
}
]
},
{
"title": "Two estimates of the same variance",
"blocks": [
{
"pages": [
9,
10
],
"main": "**The within-groups variance estimates the population variance from the spread inside each group.** Treatment cannot change the spread inside a group, so this estimate stays honest whether or not the treatment works. With equal group sizes, it is the average of the group variances."
},
{
"pages": [
6,
8,
11,
12
],
"main": "**The between-groups variance estimates the same population variance from how spread out the group means are.** The variance of a group mean is the population variance divided by n. So multiplying the variance of the means by n puts it back on the scale of individuals.",
"sub": [
"If the treatment works, the means spread apart, so this estimate gets too big."
],
"end": "So under the null hypothesis both estimates should be about the same size."
}
]
},
{
"title": "The F ratio",
"blocks": [
{
"pages": [
13,
14
],
"main": "**The F ratio divides the between-groups estimate by the within-groups estimate.** When the null hypothesis is true, F is near 1. When the means really differ, the top grows, so F gets large. If F is bigger than the cutoff in the F table, you reject the null hypothesis.",
"sub": [
"F has two degrees of freedom, one for the top and one for the bottom. The top uses the number of groups minus 1. The bottom uses the number of groups times one less than the group size."
]
},
{
"pages": [
16,
17,
18
],
"main": "**In the cell-phone and sperm-motility example, F was compared with the table cutoff to decide whether motility differed among groups.** The same steps work for any balanced design."
}
]
}
],
"questions": [
{
"q": "Why is the within-groups variance not affected by the treatment?",
"a": "The within-groups variance is not affected because it only looks at spread inside each group. Everyone in a group got the same treatment, so the treatment cannot make them spread out more."
},
{
"q": "Why is the variance of the means multiplied by n?",
"a": "It is multiplied by n because means vary less than individuals. The variance of a mean is the population variance divided by n, so multiplying by n puts it back on the scale of individuals."
},
{
"q": "What does an F near 1 tell you?",
"a": "An F near 1 tells you the group means differ about as much as random sampling would cause. The two variance estimates agree, so there is no evidence of a treatment effect."
}
],
"memorize": []
},
{
"id": 7,
"tier": "asked",
"title": "Doing ANOVA from start to finish",
"lead": "A balanced ANOVA can be done from each group's mean and SD, and the same numbers appear in R output.",
"topics": [
{
"title": "Setting up the test",
"blocks": [
{
"pages": [
5,
8
],
"main": "**Start an ANOVA by naming the test and writing the null hypothesis about the actual study.** A good null hypothesis names the outcome and the groups, such as no difference in rate of bone loss among the three treatment groups. ANOVA assumes Normal data, equal variances and independent groups.",
"end": "So the first two lines of every answer are the test and the null hypothesis in words."
}
]
},
{
"title": "The calculation in order",
"blocks": [
{
"pages": [
6,
7,
10,
11,
12,
13
],
"main": "**The within estimate comes from the group SDs, and the between estimate comes from the group means.** Average the squared SDs to get the within-groups variance. Find the grand mean, then the variance of the group means around it, and multiply by n.",
"sub": [
"The F ratio is the between estimate divided by the within estimate."
]
},
{
"pages": [
14,
16,
24,
25
],
"main": "**The decision compares F with the table cutoff at the stated significance level.** If the exact denominator degrees of freedom are not printed, you use the two printed rows on either side. If F is bigger than both, you reject the null hypothesis.",
"sub": [
"When you reject at 0.05, the homework guidelines say to check a stricter level like 0.01 as well, so the P range is as tight as possible."
],
"end": "So the conclusion sentence repeats the null hypothesis wording and adds the P value."
}
]
},
{
"title": "Reading ANOVA output",
"blocks": [
{
"pages": [
36,
38,
39
],
"main": "**In R output, the Residuals row holds the within-groups information.** Its Mean Sq is the within-groups variance and its Df is the denominator degrees of freedom. The treatment row holds the between-groups information, and the F value and Pr(>F) give the test result.",
"end": "That is why later pairwise tests take the within variance straight from the Residuals Mean Sq."
},
{
"pages": [
26,
27,
28,
29,
30,
31
],
"main": "**Sums of squares are another way to write the same two estimates.** Each mean square is a sum of squares divided by its degrees of freedom. This hand version was not required on the midterm."
}
]
}
],
"questions": [
{
"q": "Why is \"mu 1 equals mu 2 equals mu 3\" not an acceptable null hypothesis?",
"a": "It is not acceptable because it does not say anything about the study. The null hypothesis has to name the real outcome and groups, like no difference in hematocrit among the placebo and two dose groups."
},
{
"q": "Which line of R's aov output gives the within-groups variance?",
"a": "The Residuals line gives the within-groups variance. Its Mean Sq column is the within variance, and its Df column is the degrees of freedom you use for the table."
},
{
"q": "If ANOVA finds a difference, do you say which groups differ?",
"a": "No, you do not say which groups differ unless the question asks. ANOVA only shows that at least one mean is different, so finding which ones needs a separate pairwise method."
}
],
"memorize": [
{
"title": "Balanced ANOVA from means and SDs",
"when": "The problem gives three or more independent groups of equal size, with a mean and SD for each.",
"steps": [
{
"do": "Name the test as analysis of variance and write the reason in parentheses.",
"why": "This is because there are more than two groups of different subjects with interval, Normal data, and the solutions state that reason."
},
{
"do": "Write the null hypothesis in words about the outcome and the groups.",
"why": "This is because a generic equation loses points."
},
{
"do": "List m, the number of groups, and n, the number in each group.",
"why": "This is because every later formula uses them."
},
{
"do": "Write each general equation before you put in the numbers.",
"why": "This is because the grading rules give credit for the equation itself, not only the answer."
},
{
"do": "Average the squared SDs to get the within-groups variance.",
"why": "This is because the spread inside groups estimates the population variance.",
"tex": "s^2_{wit}=\\frac{1}{m}\\sum s_i^2"
},
{
"do": "Find the grand mean and the variance of the group means.",
"why": "This is because the spread of the means is the other route to the variance.",
"tex": "s^2_{\\bar X}=\\frac{\\sum(\\bar x_i-\\bar X)^2}{m-1}"
},
{
"do": "Multiply that variance by n to get the between-groups variance.",
"why": "This is because the variance of a mean is the population variance divided by n.",
"tex": "s^2_{bet}=n\\,s^2_{\\bar X}"
},
{
"do": "Divide between by within to get F.",
"why": "This is because F compares the two estimates.",
"tex": "F=\\frac{s^2_{bet}}{s^2_{wit}}"
},
{
"do": "Write both degrees of freedom.",
"why": "This is because the F table needs both.",
"tex": "\\nu_n=m-1,\\quad \\nu_d=m(n-1)"
},
{
"do": "Write the critical value with its alpha and degrees of freedom, like F0.05(2, 33), bracketing with the printed rows on either side if that row is missing.",
"why": "This is because you must report the critical value you compared against.",
"table": "Use the class F table (upper tail). Numerator degrees of freedom run across the top and denominator degrees of freedom run down the side. Lightface numbers are for 0.05 and boldface numbers are for 0.01.",
"tablePath": "sources/tables/F_table.pdf"
},
{
"do": "Compare F with the cutoff and write the full conclusion with a P range.",
"why": "This is because the conclusion must restate the null hypothesis and give P if you reject."
},
{
"do": "Stop without naming which groups differ unless asked.",
"why": "This is because the exam rules say not to isolate differences unless told to."
}
],
"example": {
"source": "Exam 1 Question 4",
"prompt": "Postmenopausal women were randomized to three treatment groups (\\(n = 12\\) each) and their rate of bone loss was measured for 2 years. Is there a difference in the rate of bone loss among these three groups? Use \\(\\alpha = 0.05\\), and if a difference exists do not identify which groups are different.",
"table": {
"headers": [
"Group",
"Mean rate of bone loss (%/year)",
"SD (%/year)"
],
"rows": [
[
"1: estrogen cream, placebo calcium",
"0.43",
"1.6"
],
[
"2: placebo cream, 2000 mg/day calcium",
"2.62",
"2.68"
],
[
"3: placebo cream, placebo calcium",
"3.98",
"1.63"
]
]
},
"steps": [
{
"say": "The test is analysis of variance (there are more than two groups made of different subjects, and the data are interval and Normally distributed).",
"work": []
},
{
"say": "The null hypothesis is that there is no difference in the mean rate of bone loss among women in these three treatment groups.",
"work": []
},
{
"say": "There are three groups and 12 women in each group.",
"work": [
"m=3",
"n=12"
]
},
{
"say": "These are the general equations, written before any numbers go in, because each one earns credit on its own.",
"work": [
"s^2_{wit}=\\frac{1}{m}\\sum_{i=1}^{m}s_i^2",
"\\bar X=\\frac{1}{m}\\sum_{i=1}^{m}\\bar x_i",
"s^2_{\\bar X}=\\frac{\\sum_{i=1}^{m}(\\bar x_i-\\bar X)^2}{m-1}",
"s^2_{bet}=n\\,s^2_{\\bar X}",
"F=\\frac{s^2_{bet}}{s^2_{wit}}",
"\\nu_n=m-1,\\quad \\nu_d=m(n-1)"
]
},
{
"say": "Square each SD and average the three squares. This gives the within-groups variance.",
"work": [
"s^2_{wit}=\\frac{1}{m}\\sum_{i=1}^{m}s_i^2",
"s^2_{wit}=\\frac{1}{3}\\left(1.6^2+2.68^2+1.63^2\\right)=\\frac{1}{3}(2.56+7.1824+2.6569)",
"=\\frac{12.3993}{3}=4.1331\\;(\\%/\\mathrm{yr})^2"
]
},
{
"say": "Average the three group means to get the grand mean. Then find how far each group mean sits from it and turn that into a variance.",
"work": [
"\\bar X=\\frac{1}{m}\\sum_{i=1}^{m}\\bar x_i=\\frac{1}{3}(0.43+2.62+3.98)=2.3433\\;\\%/\\mathrm{yr}",
"s^2_{\\bar X}=\\frac{\\sum_{i=1}^{m}(\\bar x_i-\\bar X)^2}{m-1}",
"s^2_{\\bar X}=\\frac{(0.43-2.3433)^2+(2.62-2.3433)^2+(3.98-2.3433)^2}{3-1}",
"=\\frac{3.6608+0.07654+2.6787}{2}=\\frac{6.4161}{2}=3.2080\\;(\\%/\\mathrm{yr})^2"
]
},
{
"say": "Multiply by the 12 women per group. This gives the between-groups variance.",
"work": [
"s^2_{bet}=n\\,s^2_{\\bar X}",
"s^2_{bet}=12(3.2080)=38.496\\;(\\%/\\mathrm{yr})^2"
]
},
{
"say": "Divide the between-groups variance by the within-groups variance.",
"work": [
"F=\\frac{s^2_{bet}}{s^2_{wit}}",
"F=\\frac{38.496}{4.1331}=9.314"
]
},
{
"say": "The numerator uses the number of groups minus 1. The denominator uses the 11 free values in each of the three groups.",
"work": [
"\\nu_n=m-1=3-1=2",
"\\nu_d=m(n-1)=3(12-1)=33"
]
},
{
"say": "Row 33 is not printed in the F table, so the cutoff sits between rows 32 and 34 in the column for 2. Lightface numbers give 0.05 and boldface numbers give 0.01.",
"work": [
"F_{0.05}(2,34)=3.28<F_{0.05}(2,33)<F_{0.05}(2,32)=3.30",
"F_{0.01}(2,34)=5.29<F_{0.01}(2,33)<F_{0.01}(2,32)=5.34"
]
},
{
"say": "F is larger than both cutoffs, so reject the null hypothesis. There is a difference in the mean rate of bone loss among women in these three treatment groups, with P less than 0.01.",
"work": [
"F=9.314>F_{0.05}(2,32)=3.30>F_{0.05}(2,33)",
"F=9.314>F_{0.01}(2,32)=5.34>F_{0.01}(2,33)",
"P<0.01"
]
},
{
"say": "The question says not to identify which groups are different, so the answer ends with the overall conclusion and no pairwise tests.",
"work": []
}
]
}
},
{
"title": "Read an R aov table",
"when": "The problem gives ANOVA output from R instead of raw data.",
"steps": [
{
"do": "Find the treatment row and read its Df as the numerator degrees of freedom.",
"why": "This is because it equals the number of groups minus 1."
},
{
"do": "Find the Residuals row and read its Df and Mean Sq.",
"why": "This is because these are the within degrees of freedom and the within variance."
},
{
"do": "Read the F value and Pr(>F).",
"why": "This is because they give the test result and its P value."
},
{
"do": "Keep the Residuals Mean Sq for any pairwise tests that follow.",
"why": "This is because pairwise t tests reuse it as the pooled variance."
}
],
"example": {
"source": "Homework 1 Problem 5(b)",
"prompt": "165 subjects with raised BNP levels were randomly assigned to a placebo, an experimental drug or the standard treatment (55 per group). R gives this ANOVA output from aov(BNP ~ Group). Read the table and state the result.",
"table": {
"headers": [
"",
"Df",
"Sum Sq",
"Mean Sq",
"F value",
"Pr(>F)"
],
"rows": [
[
"Group",
"2",
"47686",
"23843",
"11.49",
"2.16e-05 ***"
],
[
"Residuals",
"162",
"336188",
"2075",
"",
""
]
]
},
"steps": [
{
"say": "The Group row has Df 2, which is the numerator degrees of freedom because there are three groups.",
"work": [
"\\nu_n=\\text{Df}_{\\text{Group}}=2",
"\\nu_n=m-1=3-1=2"
]
},
{
"say": "The Residuals row has Df 162 and Mean Sq 2075. These are the within degrees of freedom and the within-groups variance.",
"work": [
"\\nu_d=\\text{Df}_{\\text{Residuals}}=162",
"\\nu_d=N-m=165-3=162",
"s^2_{wit}=\\text{Mean Sq}_{\\text{Residuals}}=\\frac{336188}{162}=2075\\;(\\mathrm{pg/mL})^2"
]
},
{
"say": "F is 11.49 and P is \\(2.16\\times10^{-5}\\), so reject the null hypothesis. There is a difference in BNP levels among the three treatment groups, with P less than 0.001.",
"work": [
"F=\\frac{\\text{Mean Sq}_{\\text{Group}}}{\\text{Mean Sq}_{\\text{Residuals}}}=\\frac{23843}{2075}=11.49",
"P=2.16\\times10^{-5}<0.001"
]
},
{
"say": "Keep 2075 as the within-groups variance with 162 degrees of freedom, because any pairwise t tests after this ANOVA reuse them.",
"work": [
"s^2_{wit}=2075\\;(\\mathrm{pg/mL})^2",
"\\nu=162"
]
}
]
}
}
]
},
{
"id": 8,
"tier": "review",
"title": "t tests for two groups and for one group",
"lead": "A t statistic divides an observed difference by the uncertainty in that difference.",
"topics": [
{
"title": "The idea of the t statistic",
"blocks": [
{
"pages": [
3,
4,
5
],
"main": "**A t statistic is the difference between two means divided by the standard error of that difference.** A big difference with small uncertainty gives a large t, so it is strong evidence. The same difference with more noise gives a smaller t.",
"end": "So t measures the difference in units of its own uncertainty."
},
{
"pages": [
6,
7,
8
],
"main": "**The variances of two independent means add, even when you subtract the means.** Both means carry their own uncertainty, so the difference carries both. When the two groups are assumed to have equal variance, you combine their sample variances into one **pooled variance**, weighted by each group's degrees of freedom."
}
]
},
{
"title": "Running the unpaired t test",
"blocks": [
{
"pages": [
9,
10,
11,
12,
13
],
"main": "**The unpaired t test compares two separate groups and uses n1 plus n2 minus 2 degrees of freedom.** It is **two-tailed** because a difference in either direction counts. The t table lists two-tail areas, so you read the column for your significance level directly.",
"sub": [
"You compare the size of t, ignoring its sign, with the table cutoff."
]
},
{
"pages": [
17,
18,
19
],
"main": "**When t is smaller than the cutoff, you do not reject the null hypothesis.** That means the data did not show a difference, not that the groups are proven equal."
}
]
},
{
"title": "The one-sample t test",
"blocks": [
{
"pages": [
20,
21,
22,
23,
24
],
"main": "**A one-sample t test compares one group's mean with a fixed reference value.** The reference value is a number from outside the sample, like a known population average. The standard error is the sample SD divided by the square root of n, and the degrees of freedom are n minus 1."
}
]
}
],
"questions": [
{
"q": "Why do you add variances when you subtract two means?",
"a": "You add them because each mean has its own random error. Subtracting one mean from the other does not cancel those errors, so the uncertainty of the difference includes both."
},
{
"q": "When do you use a one-sample t test instead of an unpaired t test?",
"a": "You use a one-sample t test when there is one group compared with a fixed number. You use an unpaired t test when there are two separate groups of subjects to compare with each other."
},
{
"q": "What does \"do not reject the null hypothesis\" mean?",
"a": "It means the data did not give enough evidence of a difference. It does not prove the groups are the same, because a small study can miss a real difference."
}
],
"memorize": [
{
"title": "Unpaired two-sample t test",
"when": "The problem gives two separate groups of subjects, each with a mean, SD and n.",
"steps": [
{
"do": "Name the test as the unpaired two-sample t test.",
"why": "This is because there are two groups of different subjects."
},
{
"do": "Write the null hypothesis in words.",
"why": "This is because it must name the outcome and the two groups."
},
{
"do": "Write each general equation before you put in the numbers.",
"why": "This is because the grading rules give credit for the equation itself, not only the answer."
},
{
"do": "Pool the two variances.",
"why": "This is because the groups are assumed to share one variance.",
"tex": "s_p^2=\\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}"
},
{
"do": "Divide the difference in means by its standard error.",
"why": "This is because t measures the difference in units of uncertainty.",
"tex": "t=\\frac{\\bar x_1-\\bar x_2}{\\sqrt{s_p^2\\left(\\frac{1}{n_1}+\\frac{1}{n_2}\\right)}}"
},
{
"do": "Write the degrees of freedom.",
"why": "This is because the cutoff depends on them.",
"tex": "\\nu=n_1+n_2-2"
},
{
"do": "Write the two-tailed cutoff with its alpha and degrees of freedom, like t0.05(47), and compare the size of t.",
"why": "This is because a difference in either direction counts and the cutoff must be reported.",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "If you reject, check 0.01 as well and write the conclusion with the P range.",
"why": "This is because the homework guidelines ask for the tightest P range you can show."
}
],
"example": {
"source": "Homework 2 Problem 1(a)",
"prompt": "Subjects over 65 with cognitive decline were split into a control group (\\(n_1 = 22\\), \\(\\bar x_1 = 49\\), \\(s_1 = 8.4\\)) and a treatment group of diet, exercise and brain training (\\(n_2 = 27\\), \\(\\bar x_2 = 57\\), \\(s_2 = 9.5\\)). Is there a difference in cognitive scores between the two populations?",
"steps": [
{
"say": "The test is the unpaired two-sample t test, because the control group and the treatment group are made of different subjects.",
"work": []
},
{
"say": "The null hypothesis is that there is no difference in cognitive scores between the control group and the treatment group.",
"work": []
},
{
"say": "These are the general equations, written before any numbers go in.",
"work": [
"s_p^2=\\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}",
"t=\\frac{\\bar x_1-\\bar x_2}{\\sqrt{s_p^2\\left(\\frac{1}{n_1}+\\frac{1}{n_2}\\right)}}",
"\\nu=n_1+n_2-2"
]
},
{
"say": "Weight each squared SD by its group size minus 1 and divide by the total degrees of freedom. This gives one shared variance.",
"work": [
"s_p^2=\\frac{(22-1)(8.4)^2+(27-1)(9.5)^2}{22+27-2}",
"=\\frac{1481.76+2346.5}{47}=\\frac{3828.26}{47}=81.452",
"s_p=\\sqrt{81.452}=9.0251"
]
},
{
"say": "The standard error of the difference is 2.5921, so the means are about 3.1 standard errors apart.",
"work": [
"t=\\frac{49-57}{\\sqrt{81.452\\left(\\frac{1}{22}+\\frac{1}{27}\\right)}}=\\frac{-8}{\\sqrt{6.7191}}=\\frac{-8}{2.5921}=-3.086"
]
},
{
"say": "Both groups lose one degree of freedom for their own mean.",
"work": [
"\\nu=n_1+n_2-2=22+27-2=47"
]
},
{
"say": "Row 47 is not printed, so the cutoff sits between rows 46 and 48 in the 0.05 column. The size of t is larger, so reject at 0.05.",
"work": [
"t_{0.05}(46)=2.013>t_{0.05}(47)>t_{0.05}(48)=2.011",
"\\lvert t\\rvert=3.086>t_{0.05}(46)=2.013>t_{0.05}(47)"
]
},
{
"say": "The size of t also beats the 0.01 cutoff. There is a difference in cognitive scores between the control group and the treatment group, with P less than 0.01.",
"work": [
"t_{0.01}(46)=2.687>t_{0.01}(47)>t_{0.01}(48)=2.682",
"\\lvert t\\rvert=3.086>t_{0.01}(46)=2.687>t_{0.01}(47)",
"P<0.01"
]
}
]
}
},
{
"title": "One-sample t test",
"when": "The problem compares one group with a fixed number from outside the sample.",
"steps": [
{
"do": "Name the test and write the null hypothesis about the group and the reference value.",
"why": "This is because the question compares one group with an outside number."
},
{
"do": "Write each general equation before you put in the numbers.",
"why": "This is because the grading rules give credit for the equation itself, not only the answer."
},
{
"do": "Divide the difference from the reference by the SE.",
"why": "This is because the SE is the uncertainty in the sample mean.",
"tex": "t=\\frac{\\bar x-\\mu_0}{s/\\sqrt n}"
},
{
"do": "Use n minus 1 degrees of freedom and the two-tailed table.",
"why": "This is because one mean was estimated from the data.",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "Compare, decide and write the full conclusion.",
"why": "This is because the conclusion must answer the study question."
}
],
"example": {
"source": "Homework 2 Problem 1(b)",
"prompt": "The average LDL of USC faculty and staff is 115 mg/dL. A random sample of 16 USC undergraduates had mean LDL 103 mg/dL with SD 16 mg/dL. Is there a significant difference in LDL between USC undergraduates and the faculty and staff value?",
"steps": [
{
"say": "The test is the one-sample t test. The null hypothesis is that mean LDL in USC undergraduates is not different from the faculty and staff value of 115 mg/dL.",
"work": [
"\\mu_0=115\\;\\mathrm{mg/dL}"
]
},
{
"say": "These are the general equations, written before any numbers go in.",
"work": [
"t=\\frac{\\bar x-\\mu_0}{s/\\sqrt n}",
"\\nu=n-1"
]
},
{
"say": "The standard error is 4 mg/dL, so the sample mean sits 3 standard errors below 115.",
"work": [
"t=\\frac{103-115}{16/\\sqrt{16}}=\\frac{-12}{4}=-3.000"
]
},
{
"say": "One mean was estimated from the 16 students, so there are 15 degrees of freedom. Row 15 is printed in the two-tailed t table.",
"work": [
"\\nu=n-1=16-1=15",
"t_{0.05}(15)=2.131",
"t_{0.01}(15)=2.947"
]
},
{
"say": "The size of t passes both cutoffs, so reject the null hypothesis. Mean LDL in USC undergraduates differs from the faculty and staff value of 115 mg/dL, with P less than 0.01.",
"work": [
"\\lvert t\\rvert=3.000>t_{0.05}(15)=2.131",
"\\lvert t\\rvert=3.000>t_{0.01}(15)=2.947",
"P<0.01"
]
}
]
}
}
]
},
{
"id": 9,
"tier": "asked",
"title": "Finding which groups differ",
"lead": "After ANOVA finds a difference, pairwise t tests find which groups differ, with a correction so false positives do not pile up.",
"topics": [
{
"title": "Why plain repeated t tests are a problem",
"blocks": [
{
"pages": [
3,
4
],
"main": "**Each extra t test adds another chance of a false positive, so many tests together are too likely to find a fake difference.** With three comparisons at 0.05 each, the chance of at least one false positive is about 0.14, not 0.05.",
"end": "So the significance level of each test has to be made stricter."
},
{
"pages": [
5
],
"main": "**The pairwise t tests reuse the within-groups variance from the ANOVA.** It is the best estimate of the shared variance because it uses every group. Its degrees of freedom are also used for the cutoff, so the test is stronger than a two-group t test."
}
]
},
{
"title": "Bonferroni",
"blocks": [
{
"pages": [
6,
7,
8
],
"main": "**The Bonferroni correction divides the overall significance level by the number of comparisons.** Every pair is then tested at that same stricter level. It is simple and safe, but it can miss real differences because it is very strict."
}
]
},
{
"title": "Holm",
"blocks": [
{
"pages": [
9,
10,
11
],
"main": "**The Holm correction tests the strongest result first and loosens the level one step at a time.** You order the comparisons from the largest t to the smallest. The first is tested at the overall level divided by k, the next at the overall level divided by k minus 1, and so on.",
"sub": [
"As soon as one comparison is not significant, you stop, and that comparison and all smaller ones are called not different."
],
"end": "So Holm keeps the same overall protection as Bonferroni but finds more real differences."
},
{
"pages": [
12,
13,
14
],
"main": "**When only comparisons with a control group are wanted, k counts only those comparisons.** Fewer comparisons means a less strict level for each one."
}
]
}
],
"questions": [
{
"q": "Why does Holm find more differences than Bonferroni?",
"a": "Holm finds more differences because only its first comparison uses the strictest level. Each later comparison gets a looser level, so a moderate difference can still be significant."
},
{
"q": "What happens in Holm when one comparison is not significant?",
"a": "You stop at that comparison. That comparison and every comparison with a smaller t are called not different, even if their t values would pass a looser level."
},
{
"q": "Where do the variance and degrees of freedom for pairwise t tests come from?",
"a": "They come from the ANOVA. The variance is the within-groups variance, which R shows as the Residuals Mean Sq, and the degrees of freedom are the Residuals Df."
}
],
"memorize": [
{
"title": "Holm pairwise t tests after ANOVA",
"when": "ANOVA found a difference and you are asked which groups differ using Holm.",
"steps": [
{
"do": "Name the procedure as multiple pairwise t tests with the Holm correction.",
"why": "This is because that is the test being performed."
},
{
"do": "Write one null hypothesis joined by AND for every pair.",
"why": "This is because each pair is its own comparison."
},
{
"do": "Write each general equation before you put in the numbers.",
"why": "This is because the grading rules give credit for the equation itself, not only the answer."
},
{
"do": "Take the within-groups variance and its degrees of freedom from the ANOVA.",
"why": "This is because the pairwise tests share them.",
"tex": "s^2_{wit}\\ \\text{(Residuals Mean Sq)},\\quad \\nu\\ \\text{(Residuals Df)}"
},
{
"do": "Calculate t for every pair.",
"why": "This is because each pair needs its own statistic.",
"tex": "t_{AB}=\\frac{\\bar x_A-\\bar x_B}{\\sqrt{s^2_{wit}\\left(\\frac{1}{n_A}+\\frac{1}{n_B}\\right)}}"
},
{
"do": "Order the pairs from the largest size of t to the smallest.",
"why": "This is because Holm tests the strongest evidence first."
},
{
"do": "Give the jth pair its own significance level.",
"why": "This is because the level loosens one step at a time.",
"tex": "\\alpha_j=\\frac{\\alpha_T}{k-j+1}"
},
{
"do": "Look up each cutoff, bracketing between printed rows and columns when needed.",
"why": "This is because levels like 0.0167 are not printed in the table.",
"table": "Use the class t table (two-tailed) with the within-groups or residual degrees of freedom. A level like 0.0167 is not printed, so bracket it between the 0.01 and 0.02 columns, or use a cutoff the question gives.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "Go down the list, and stop at the first pair that is not significant.",
"why": "This is because the Holm rule ends there."
},
{
"do": "Write one conclusion naming which pairs differ and which do not, made with P less than 0.05.",
"why": "This is because the whole statement holds at the overall level."
}
],
"example": {
"source": "Exam 1 Question 5",
"prompt": "Subjects with low hematocrit got a placebo or one of two doses of EPO for two months. An ANOVA in R found a difference among the three groups (Treatment Df 2, Mean Sq 906.1, F 49.35, Pr(>F) 5.97e-16; Residuals Df 108, Mean Sq 18.4). Use multiple pairwise comparisons with the Holm correction at an overall level of 0.05 to find which groups differ.",
"table": {
"headers": [
"",
"Placebo",
"EPO Dose 1",
"EPO Dose 2"
],
"rows": [
[
"Mean (%)",
"31.39",
"39.87",
"40.05"
],
[
"Variance",
"28.24",
"16.65",
"10.20"
],
[
"n",
"37",
"37",
"37"
]
]
},
"steps": [
{
"say": "The procedure is multiple unpaired t tests with the Holm correction.",
"work": []
},
{
"say": "The null hypothesis is that there is no difference in hematocrit between placebo and Dose 1, AND between placebo and Dose 2, AND between Dose 1 and Dose 2.",
"work": []
},
{
"say": "These are the general equations, written before any numbers go in.",
"work": [
"t_{AB}=\\frac{\\bar x_A-\\bar x_B}{\\sqrt{s^2_{wit}\\left(\\frac{1}{n_A}+\\frac{1}{n_B}\\right)}}",
"\\alpha_j=\\frac{\\alpha_T}{k-j+1}"
]
},
{
"say": "R gives the Residuals Mean Sq as 18.4 and the Residuals Df as 108, so these are the shared variance and degrees of freedom.",
"work": [
"s^2_{wit}=18.4\\;\\%^2",
"\\nu=108"
]
},
{
"say": "All three groups have 37 subjects, so every pair shares the same standard error of 0.99729.",
"work": [
"\\sqrt{18.4\\left(\\frac{1}{37}+\\frac{1}{37}\\right)}=\\sqrt{0.99459}=0.99729",
"t_{P,D1}=\\frac{31.39-39.87}{0.99729}=\\frac{-8.48}{0.99729}=-8.503",
"t_{P,D2}=\\frac{31.39-40.05}{0.99729}=\\frac{-8.66}{0.99729}=-8.684",
"t_{D1,D2}=\\frac{39.87-40.05}{0.99729}=\\frac{-0.18}{0.99729}=-0.1805"
]
},
{
"say": "Placebo against Dose 2 has the largest size of t, so it goes first. Dose 1 against Dose 2 has the smallest, so it goes last.",
"work": [
"\\lvert t_{P,D2}\\rvert=8.684>\\lvert t_{P,D1}\\rvert=8.503>\\lvert t_{D1,D2}\\rvert=0.1805"
]
},
{
"say": "There are three comparisons, so the first pair is tested at 0.05 divided by 3 and the last pair at 0.05.",
"work": [
"k=3,\\quad \\alpha_T=0.05",
"\\alpha_1=\\frac{0.05}{3-1+1}=0.0167",
"\\alpha_2=\\frac{0.05}{3-2+1}=0.025",
"\\alpha_3=\\frac{0.05}{3-3+1}=0.05"
]
},
{
"say": "Row 108 and the levels 0.0167 and 0.025 are not printed. So each cutoff is bracketed between rows 100 and 120 and between the printed columns on either side.",
"work": [
"t_{0.01}(100)=2.626>t_{0.0167}(108)>t_{0.02}(120)=2.358",
"t_{0.02}(100)=2.364>t_{0.025}(108)>t_{0.05}(120)=1.980",
"t_{0.05}(100)=1.984>t_{0.05}(108)>t_{0.05}(120)=1.980"
]
},
{
"say": "The first two pairs beat even the top of their brackets, so both are significant. The third pair is below the bottom of its bracket, so it is not significant and the procedure stops there.",
"work": [
"\\lvert t_{P,D2}\\rvert=8.684>2.626>t_{0.0167}(108)",
"\\lvert t_{P,D1}\\rvert=8.503>2.364>t_{0.025}(108)",
"\\lvert t_{D1,D2}\\rvert=0.1805<1.980<t_{0.05}(108)"
]
},
{
"say": "There is a difference in hematocrit between placebo and Dose 2, AND between placebo and Dose 1, AND there is no difference between Dose 1 and Dose 2. This entire statement is made with P less than 0.05.",
"work": [
"P<0.05"
]
}
]
}
},
{
"title": "Bonferroni pairwise t tests",
"when": "The question tells you to use the Bonferroni correction.",
"steps": [
{
"do": "Name the procedure as multiple t tests with the Bonferroni correction.",
"why": "This is because that is the test being performed."
},
{
"do": "Write one null hypothesis joined by AND for every pair.",
"why": "This is because each pair is its own comparison."
},
{
"do": "Count the comparisons and divide the overall level by that count.",
"why": "This is because every pair shares the same stricter level.",
"tex": "\\alpha=\\frac{\\alpha_T}{k},\\quad \\nu=m(n-1)=N-m"
},
{
"do": "Calculate t for each pair with the within-groups variance.",
"why": "This is because it is the shared variance estimate."
},
{
"do": "Compare every t with the one cutoff, bracketing between printed columns or using a cutoff the question gives.",
"why": "This is because Bonferroni uses one level for every pair, and levels like 0.0167 are not printed.",
"table": "Use the class t table (two-tailed) with the within-groups or residual degrees of freedom. A level like 0.0167 is not printed, so bracket it between the 0.01 and 0.02 columns, or use a cutoff the question gives.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "Write the combined conclusion and say the entire statement is made with P less than 0.05.",
"why": "This is because the answer names every pair at the overall level."
}
],
"example": {
"source": "Homework 2 Problem 1(c)",
"prompt": "Patients were randomized to low, medium or high doses of filgrastim (\\(n = 15\\) each) and blood neutrophil count was measured. An ANOVA was significant (\\(F = 3.3839\\), \\(P < 0.05\\)) with \\(s^2_{wit} = 2.5267\\). Using pairwise comparisons with the Bonferroni correction, find which dose groups differ. You will need \\(t_{0.0167}(42)\\) from qt((0.05/2)/3, 42, lower.tail=FALSE).",
"table": {
"headers": [
"Dose group",
"Mean neutrophil count (10^9 cells/L)",
"SD (10^9 cells/L)"
],
"rows": [
[
"1: Low dose",
"3.7",
"1.1"
],
[
"2: Medium dose",
"4.6",
"1.4"
],
[
"3: High dose",
"5.2",
"2.1"
]
]
},
"steps": [
{
"say": "The procedure is multiple unpaired t tests with the Bonferroni correction.",
"work": []
},
{
"say": "The null hypothesis is that there is no difference in neutrophil count between low and medium dose, AND between low and high dose, AND between medium and high dose.",
"work": []
},
{
"say": "Three groups give three pairs, so every pair is tested at 0.05 divided by 3. The degrees of freedom are the within-groups degrees of freedom from the ANOVA.",
"work": [
"k=3",
"\\alpha=\\frac{\\alpha_T}{k}=\\frac{0.05}{3}=0.0167",
"\\nu=m(n-1)=3(15-1)=42"
]
},
{
"say": "The within-groups variance of 2.5267 is given, and it equals the average of the squared SDs. Every pair has 15 per group, so they share one standard error.",
"work": [
"s^2_{wit}=\\frac{1}{3}\\left(1.1^2+1.4^2+2.1^2\\right)=2.5267\\;(10^9\\ \\mathrm{cells/L})^2",
"t_{AB}=\\frac{\\bar x_A-\\bar x_B}{\\sqrt{s^2_{wit}\\left(\\frac{1}{n_A}+\\frac{1}{n_B}\\right)}}",
"\\sqrt{2.5267\\left(\\frac{1}{15}+\\frac{1}{15}\\right)}=\\sqrt{0.33689}=0.58043",
"t_{12}=\\frac{3.7-4.6}{0.58043}=-1.5506",
"t_{13}=\\frac{3.7-5.2}{0.58043}=-2.5843",
"t_{23}=\\frac{4.6-5.2}{0.58043}=-1.0337"
]
},
{
"say": "The printed 0.02 and 0.01 columns settle the first and third pairs. The low against high pair falls inside that bracket, so the cutoff the question gives decides it.",
"work": [
"t_{0.02}(42)=2.418<t_{0.0167}(42)<t_{0.01}(42)=2.698",
"t_{0.0167}(42)=2.4937",
"\\lvert t_{12}\\rvert=1.5506<2.418<t_{0.0167}(42)",
"\\lvert t_{13}\\rvert=2.5843>t_{0.0167}(42)=2.4937",
"\\lvert t_{23}\\rvert=1.0337<2.418<t_{0.0167}(42)"
]
},
{
"say": "There is a difference in neutrophil count between low and high dose, AND no difference between low and medium dose, AND no difference between medium and high dose. This entire statement is made with P less than 0.05.",
"work": [
"P<0.05"
]
}
]
}
}
]
},
{
"id": 10,
"tier": "review",
"title": "Sampling distributions and clinical trials",
"lead": "A statistic changes from sample to sample, and a good trial is designed so that the change you see comes from the treatment.",
"topics": [
{
"title": "A statistic is a random variable",
"blocks": [
{
"pages": [
7,
8,
9,
10
],
"main": "**A sample mean is itself a random variable, because a different sample would give a different value.** Its distribution across many samples is the **sampling distribution**. That distribution is centered on the population mean, and its spread is the standard error.",
"end": "So inference uses the sampling distribution to judge whether an observed value is surprising."
},
{
"pages": [
11,
12,
13,
14,
15
],
"main": "**The central limit theorem says sample means are close to Normal, and closer as n grows.** This works even when the individuals come from a flat or skewed population. That is why Normal methods work for averages of fairly large samples."
}
]
},
{
"title": "Where t and F come from",
"blocks": [
{
"pages": [
16,
17
],
"main": "**When the SD is estimated from the sample, the standardized mean follows a t distribution instead of Z.** The estimate adds extra uncertainty, so t has heavier tails. With more degrees of freedom, t gets closer to Z, and with infinite degrees of freedom it is Z.",
"sub": [
"That is why the last row of the t table gives Normal cutoffs."
]
},
{
"pages": [
18,
19
],
"main": "**The F statistic also has a family of sampling distributions, one for each pair of degrees of freedom.** The table cutoff depends on both."
}
]
},
{
"title": "Designing a fair clinical trial",
"blocks": [
{
"pages": [
23,
24,
25,
32
],
"main": "**A trial states its main question before it starts and assigns treatments by randomization.** **Randomization** gives each person the same chance of each treatment, so the groups start out similar. Any difference at the end can then be put down to the treatment.",
"sub": [
"Who is enrolled, and where they are treated, decides which population the results apply to."
]
},
{
"pages": [
26,
27,
28
],
"main": "**Masking keeps people from knowing who got which treatment, so expectations cannot change the results.** In a single-masked trial the patients do not know. In a double-masked trial the clinicians do not know either. In a triple-masked trial the people analyzing the data also do not know.",
"sub": [
"A **crossover** trial gives each person both treatments in turn, so each person acts as their own control."
]
},
{
"pages": [
30,
31
],
"main": "**A sham control is a fake procedure that looks like the real one.** Patients often feel better after any procedure, so a sham is needed to show that the real procedure works better than just having a procedure."
}
]
}
],
"questions": [
{
"q": "Why does the t distribution have heavier tails than Z?",
"a": "It has heavier tails because the SD is estimated from the sample instead of known. The estimate adds extra uncertainty, so extreme values are more likely, especially with few degrees of freedom."
},
{
"q": "What does randomization protect against?",
"a": "Randomization protects against the groups starting out different. Because chance decides who gets each treatment, the groups are similar at the start, so a difference at the end can be put down to the treatment."
},
{
"q": "Why would a trial use a sham procedure?",
"a": "A trial uses a sham because patients often improve after any procedure. Comparing with a sham shows whether the real procedure helps more than simply having a procedure done."
}
],
"memorize": [
{
"title": "Pick the reference distribution",
"when": "You must decide whether a statistic follows Z, t or F.",
"steps": [
{
"do": "Ask whether the population SD is known.",
"why": "This is because a known SD gives Z and an estimated SD gives t."
},
{
"do": "For a mean with an estimated SD, use t with n minus 1 degrees of freedom.",
"why": "This is because one mean was estimated from the data."
},
{
"do": "For a ratio of two variance estimates, use F with two degrees of freedom.",
"why": "This is because F compares two variances."
},
{
"do": "For a large-sample proportion, use the infinity row of the t table.",
"why": "This is because that row is the Normal distribution.",
"table": "Use the class t table, infinity row on PDF page 2. The 0.05 column gives 1.96 and the 0.01 column gives 2.576.",
"tablePath": "sources/tables/t_table.pdf#page=2"
}
],
"example": {
"source": "Exam 1 Questions 3 and 4, Homework 2 Problems 1(b) and 2(a)",
"prompt": "Name the reference distribution for each statistic. (a) Exam 1 Question 3, the mean BUN of 16 healthy adults compared with the cutoff 15 mg/100mL, when the population mean is \\(\\mu = 18\\) mg/100mL and the population SD is \\(\\sigma = 6\\) mg/100mL. (b) Homework 2 Problem 1(b), the mean LDL of 16 undergraduates, \\(\\bar x = 103\\) mg/dL, compared with 115 mg/dL, with \\(s = 16\\) mg/dL found from the sample. (c) Exam 1 Question 4, the ANOVA ratio for three groups of 12. (d) Homework 2 Problem 2(a), the difference in the proportion of female babies for 186 and 220 births.",
"steps": [
{
"say": "In (a) the population SD of 6 is given, so the standardized mean follows Z. In (b) the SD of 16 comes from the sample, so it does not follow Z.",
"work": [
"\\sigma_{\\bar X}=\\frac{\\sigma}{\\sqrt n}=\\frac{6}{\\sqrt{16}}=1.5",
"Z=\\frac{\\bar x-\\mu}{\\sigma/\\sqrt n}=\\frac{15-18}{1.5}=-2.00\\sim N(0,1)"
]
},
{
"say": "In (b) the SD is estimated from 16 students, so the statistic follows t with 15 degrees of freedom.",
"work": [
"t=\\frac{\\bar x-\\mu_0}{s/\\sqrt n}\\sim t(n-1)",
"t=\\frac{103-115}{16/\\sqrt{16}}=-3.000,\\quad \\nu=n-1=16-1=15"
]
},
{
"say": "In (c) F divides one variance estimate by another, so it follows F with 2 and 33 degrees of freedom.",
"work": [
"F=\\frac{s^2_{bet}}{s^2_{wit}}\\sim F(\\nu_n,\\nu_d)",
"\\nu_n=m-1=3-1=2,\\quad \\nu_d=m(n-1)=3(12-1)=33"
]
},
{
"say": "In (d) the samples are large, so the z statistic for two proportions is compared with the infinity row of the t table. That row is the Normal distribution.",
"work": [
"z_{crit,0.05}=t_{0.05}(\\infty)=1.9600",
"z_{crit,0.01}=t_{0.01}(\\infty)=2.5758"
]
}
]
}
}
]
},
{
"id": 11,
"tier": "review",
"title": "Comparing two proportions",
"lead": "When the outcome is yes or no, groups are compared by the proportion who had the event.",
"topics": [
{
"title": "A proportion is a mean of zeros and ones",
"blocks": [
{
"pages": [
3,
5,
6,
8
],
"main": "**If each person is coded 1 for the event and 0 otherwise, the mean of those codes is the proportion with the event.** So the same mean-and-spread ideas apply. The variance of one yes-or-no outcome is p times 1 minus p, which is largest when the split is even."
}
]
},
{
"title": "The standard error of a proportion",
"blocks": [
{
"pages": [
9,
10,
11
],
"main": "**A sample proportion changes from sample to sample, and its standard error measures by how much.** The standard error is the square root of p times 1 minus p over n. Bigger samples give a smaller standard error, so the proportion is more precise."
}
]
},
{
"title": "The z test with Yates correction",
"blocks": [
{
"pages": [
13,
14,
15
],
"main": "**The z test divides the difference in proportions by its standard error, using one pooled proportion.** Under the null hypothesis both groups share the same event rate, so the two groups are combined to estimate it. The **Yates correction** subtracts a small amount from the difference, because counts jump in whole steps while the Normal curve is smooth.",
"end": "So the corrected z is a little smaller and a little more cautious."
},
{
"pages": [
18,
20,
21
],
"main": "**The cutoff for z comes from the infinity row of the t table.** At 0.05 two-tailed the cutoff is 1.96. If the size of z is bigger, the proportions differ."
}
]
}
],
"questions": [
{
"q": "Why can a proportion be treated like a mean?",
"a": "A proportion can be treated like a mean because coding yes as 1 and no as 0 makes the average of the codes equal to the proportion of yes answers. So standard errors and Normal methods work the same way."
},
{
"q": "Why is the proportion pooled in the z test?",
"a": "It is pooled because the null hypothesis says both groups have the same event rate. Combining the groups gives the best estimate of that one shared rate."
},
{
"q": "What does the Yates correction do?",
"a": "The Yates correction makes the test a little more cautious. Counts can only change in whole steps, so it subtracts a small amount from the difference before dividing by the standard error."
}
],
"memorize": [
{
"title": "z test for two proportions",
"when": "The problem gives two groups and the number of people in each who had a yes-or-no event.",
"steps": [
{
"do": "Name the z test and write the null hypothesis in words.",
"why": "This is because the data are nominal and there are two groups."
},
{
"do": "Write each general equation before you put in the numbers.",
"why": "This is because the grading rules give credit for the equation itself, not only the answer."
},
{
"do": "Calculate each group's proportion and the pooled proportion.",
"why": "This is because the null hypothesis assumes one shared rate.",
"tex": "\\hat p=\\frac{\\text{total events}}{n_1+n_2}"
},
{
"do": "Subtract the Yates correction from the size of the difference.",
"why": "This is because counts change in whole steps.",
"tex": "z=\\frac{|\\hat p_1-\\hat p_2|-\\frac12\\left(\\frac1{n_1}+\\frac1{n_2}\\right)}{\\sqrt{\\hat p(1-\\hat p)\\left(\\frac1{n_1}+\\frac1{n_2}\\right)}}"
},
{
"do": "Use the infinity row of the t table for the cutoff.",
"why": "This is because that row is the Normal distribution.",
"table": "Use the class t table, infinity row on PDF page 2. The 0.05 column gives 1.96 and the 0.01 column gives 2.576.",
"tablePath": "sources/tables/t_table.pdf#page=2"
},
{
"do": "Compare, decide and write the conclusion with a P range.",
"why": "This is because the answer must state what the data show."
}
],
"example": {
"source": "Homework 2 Problem 2(a)",
"prompt": "When only the father was exposed to dioxin, the proportion of female babies was 0.565 out of 186 births. When only the mother was exposed, it was 0.455 out of 220 births. Of all 406 babies, 205 were female. Use a z test to decide whether the proportion of female babies differs between the two exposure groups.",
"steps": [
{
"say": "The test is the z test for two proportions, because sex of the baby is nominal and there are two groups. The null hypothesis is that there is no difference in the proportion of female babies when only the father or only the mother was exposed to dioxin.",
"work": []
},
{
"say": "These are the general equations, written before any numbers go in.",
"work": [
"\\hat p=\\frac{\\text{total events}}{n_1+n_2}",
"z=\\frac{\\lvert\\hat p_1-\\hat p_2\\rvert-\\frac{1}{2}\\left(\\frac{1}{n_1}+\\frac{1}{n_2}\\right)}{\\sqrt{\\hat p(1-\\hat p)\\left(\\frac{1}{n_1}+\\frac{1}{n_2}\\right)}}"
]
},
{
"say": "The two group proportions are given. The pooled proportion uses all 205 female babies out of 406 births, because the null hypothesis says both groups share one rate.",
"work": [
"\\hat p_1=0.565,\\quad n_1=186",
"\\hat p_2=0.455,\\quad n_2=220",
"\\hat p=\\frac{205}{186+220}=\\frac{205}{406}=0.5049"
]
},
{
"say": "The Yates correction takes 0.0049609 off the gap of 0.110 between the proportions. Dividing by the standard error gives z.",
"work": [
"\\frac{1}{2}\\left(\\frac{1}{186}+\\frac{1}{220}\\right)=\\frac{1}{2}(0.0099218)=0.0049609",
"\\lvert 0.565-0.455\\rvert-0.0049609=0.10504",
"\\sqrt{0.5049(1-0.5049)\\left(\\frac{1}{186}+\\frac{1}{220}\\right)}=\\sqrt{0.0024802}=0.049802",
"z=\\frac{0.10504}{0.049802}=2.109"
]
},
{
"say": "A large-sample z is compared with the infinity row of the t table, because that row is the Normal distribution.",
"work": [
"z_{crit,0.05}=t_{0.05}(\\infty)=1.9600",
"z_{crit,0.01}=t_{0.01}(\\infty)=2.5758"
]
},
{
"say": "The size of z passes the 0.05 cutoff but not the 0.01 cutoff, so reject at 0.05 only. The proportion of female babies differs between father-only and mother-only exposure, with P less than 0.05.",
"work": [
"\\lvert z\\rvert=2.109>t_{0.05}(\\infty)=1.9600",
"\\lvert z\\rvert=2.109<t_{0.01}(\\infty)=2.5758",
"0.01<P<0.05"
]
}
]
}
}
]
},
{
"id": 12,
"tier": "asked",
"title": "Chi-square tests for tables of counts",
"lead": "A chi-square test compares the counts you saw with the counts you would expect if the treatment did nothing.",
"topics": [
{
"title": "Expected counts",
"blocks": [
{
"pages": [
5,
6,
7,
8
],
"main": "**Expected counts show what the table would look like if the treatment had no effect.** If every group had the same outcome rate, each group would split in the same proportion as the whole sample. So each expected count is the row total times the column total, divided by the grand total.",
"end": "That keeps every row total and column total the same as in the real table."
},
{
"pages": [
12,
13,
14
],
"main": "**The same rule works for a table of any size.** A table with three treatment groups and two outcomes needs six expected counts."
}
]
},
{
"title": "The chi-square statistic",
"blocks": [
{
"pages": [
9,
10,
11
],
"main": "**Chi-square adds up, over every cell, the squared gap between observed and expected, divided by expected.** A big total means the counts are far from what no effect predicts. The degrees of freedom are the number of rows minus 1 times the number of columns minus 1, and the table gives upper-tail cutoffs.",
"sub": [
"For a two-by-two table, the Yates correction subtracts one half from the size of each gap before squaring."
]
}
]
},
{
"title": "Which groups differ",
"blocks": [
{
"pages": [
16,
17,
18,
19,
20,
21
],
"main": "**To find which groups differ, you split the big table into two-by-two subtables and correct with Holm.** Each subtable has 1 degree of freedom and uses Yates. You order the chi-square values from largest to smallest and apply the Holm levels as with t tests."
}
]
},
{
"title": "Goodness of fit",
"blocks": [
{
"pages": [
22,
23,
24
],
"main": "**A goodness-of-fit test compares one set of counts with a set of expected proportions.** The expected counts come from the stated proportions times the total. The degrees of freedom are the number of categories minus 1."
}
]
}
],
"questions": [
{
"q": "Why is each expected count the row total times the column total over the grand total?",
"a": "It is because no effect means every group has the same outcome rate. The column total over the grand total is that shared rate, so multiplying by the group's row total gives the count that group would have."
},
{
"q": "When do you use the Yates correction for chi-square?",
"a": "You use it for a two-by-two table. It subtracts one half from the size of each observed-minus-expected gap before squaring, which makes the test a little more cautious."
},
{
"q": "How do you find which of three groups differ after a chi-square test?",
"a": "You make a two-by-two subtable for each pair and run a Yates-corrected chi-square on each. Then you apply the Holm correction, starting with the largest chi-square value."
}
],
"memorize": [
{
"title": "Chi-square test for a table",
"when": "The problem gives a table counting an outcome in two or more groups.",
"steps": [
{
"do": "Name the chi-square test and the table size.",
"why": "This is because the data are nominal counts."
},
{
"do": "Write the null hypothesis in words.",
"why": "This is because it names the outcome and the groups."
},
{
"do": "Write each general equation before you put in the numbers.",
"why": "This is because the grading rules give credit for the equation itself, not only the answer."
},
{
"do": "Add row totals, column totals and the grand total.",
"why": "This is because expected counts are built from them."
},
{
"do": "Build the full expected table.",
"why": "This is because it shows what no effect would look like.",
"tex": "E_{ij}=\\frac{R_i\\,C_j}{n}"
},
{
"do": "Add up the cell contributions, using Yates if the table is two by two.",
"why": "This is because chi-square totals the standardized gaps.",
"tex": "\\chi^2=\\sum\\frac{(O-E)^2}{E},\\quad \\chi^2_{Yates}=\\sum\\frac{\\left(|O-E|-\\tfrac12\\right)^2}{E}"
},
{
"do": "Write the degrees of freedom.",
"why": "This is because the cutoff depends on them.",
"tex": "\\nu=(r-1)(c-1)"
},
{
"do": "Start with alpha 0.05, and if you reject, check 0.01 and 0.001 and report the tightest P range.",
"why": "This is because a large chi-square means the counts do not fit no effect, and the P range should be as tight as you can show.",
"table": "Use the class chi-square table (upper tail). Read the row for the degrees of freedom and the column for alpha. For 1 degree of freedom at 0.05 the printed value is 3.841.",
"tablePath": "sources/tables/Chi_Squared_Table2.pdf"
}
],
"example": {
"source": "Exam 1 Question 6",
"prompt": "Subjects at a military medical center were randomized to duct tape, cryotherapy or salicylic acid and checked for complete wart resolution after two months. Is there a difference in rates of wart resolution among the treatment groups? Use \\(\\alpha=0.05\\), and do not isolate differences.",
"table": {
"headers": [
"",
"Duct tape",
"Cryotherapy",
"Salicylic acid"
],
"rows": [
[
"Complete wart resolution",
"134",
"107",
"122"
],
[
"Warts remain",
"94",
"105",
"99"
]
]
},
"steps": [
{
"say": "This is a chi-square test because the outcome is a nominal count. The table is 2 by 3, with two outcomes in the rows and three treatments in the columns.",
"work": [
"\\chi^2\\ \\text{test},\\ 2\\times 3\\ \\text{contingency table}"
]
},
{
"say": "There is no difference in the rates of wart resolution among the duct tape, cryotherapy and salicylic acid groups.",
"work": []
},
{
"say": "Write the expected count, the chi-square sum and the degrees of freedom before any numbers go in.",
"work": [
"E_{ij}=\\frac{R_i\\,C_j}{n}",
"\\chi^2=\\sum\\frac{(O-E)^2}{E}",
"\\nu=(r-1)(c-1)"
]
},
{
"say": "Add across each row and down each column. Both sets of totals give the same grand total of 661 subjects.",
"work": [
"R_1=134+107+122=363",
"R_2=94+105+99=298",
"C_1=134+94=228,\\quad C_2=107+105=212,\\quad C_3=122+99=221",
"n=363+298=661"
]
},
{
"say": "Each expected count is its row total times its column total over 661. These six counts are what no treatment effect would look like.",
"work": [
"E_{ij}=\\frac{R_i\\,C_j}{n}",
"E_{11}=\\frac{363\\cdot 228}{661}=125.210,\\quad E_{12}=\\frac{363\\cdot 212}{661}=116.424,\\quad E_{13}=\\frac{363\\cdot 221}{661}=121.366",
"E_{21}=\\frac{298\\cdot 228}{661}=102.790,\\quad E_{22}=\\frac{298\\cdot 212}{661}=95.576,\\quad E_{23}=\\frac{298\\cdot 221}{661}=99.634"
]
},
{
"say": "The table is 2 by 3 and not 2 by 2, so no Yates correction is used. The six standardized gaps add up to 3.068.",
"work": [
"\\chi^2=\\sum\\frac{(O-E)^2}{E}",
"\\frac{(134-125.210)^2}{125.210}=0.6171,\\quad \\frac{(107-116.424)^2}{116.424}=0.7628,\\quad \\frac{(122-121.366)^2}{121.366}=0.003312",
"\\frac{(94-102.790)^2}{102.790}=0.7517,\\quad \\frac{(105-95.576)^2}{95.576}=0.9292,\\quad \\frac{(99-99.634)^2}{99.634}=0.004034",
"\\chi^2=0.6171+0.7628+0.003312+0.7517+0.9292+0.004034=3.068"
]
},
{
"say": "There are 2 rows and 3 columns, so the test has 2 degrees of freedom.",
"work": [
"\\nu=(r-1)(c-1)",
"\\nu=(2-1)(3-1)=2"
]
},
{
"say": "The printed cutoff for 2 degrees of freedom at 0.05 is 5.991. Because 3.068 is below it, do not reject the null, so the resolution rates do not differ among the three treatments (P greater than 0.05).",
"work": [
"\\chi^2_{0.05}(2)=5.991",
"\\chi^2=3.068<5.991=\\chi^2_{0.05}(2)",
"\\text{do not reject } H_0,\\ P>0.05"
]
}
]
}
},
{
"title": "Pairwise chi-square with Holm from R output",
"when": "You are given chisq.test results for each pair and asked which groups differ.",
"steps": [
{
"do": "Name the procedure as multiple pairwise chi-square tests with Holm.",
"why": "This is because each pair is a separate two-by-two test."
},
{
"do": "Keep only the comparisons the question asks for.",
"why": "This is because k counts only those comparisons."
},
{
"do": "Write one null hypothesis joined by AND for those comparisons.",
"why": "This is because each comparison is its own test."
},
{
"do": "Use 1 degree of freedom for every subtable.",
"why": "This is because each one is two by two."
},
{
"do": "Order the chi-square values from largest to smallest and set the Holm levels.",
"why": "This is because Holm tests the strongest result first.",
"tex": "\\alpha_j=\\frac{\\alpha_T}{k-j+1}"
},
{
"do": "For a level like 0.0167, bracket between the printed 0.01 and 0.025 columns.",
"why": "This is because that level is not printed in the table.",
"table": "Use the class chi-square table with 1 degree of freedom. A level like 0.0167 is not printed, so bracket it between the 0.01 and 0.025 columns.",
"tablePath": "sources/tables/Chi_Squared_Table2.pdf"
},
{
"do": "Go down the list and stop at the first failure.",
"why": "This is because that is the Holm stopping rule."
},
{
"do": "Write the combined conclusion with P less than 0.05.",
"why": "This is because the statement covers all the comparisons together."
}
],
"example": {
"source": "Homework 2 Problem 3(b)",
"prompt": "Heart attack patients got standard care (control) or one of three clot-dissolving treatments, and 30-day deaths were counted. R gave the Yates-corrected chi-square for all six pairs. Use the Holm correction with \\(\\alpha_T=0.05\\) to find which treatments differ from the control.",
"table": {
"headers": [
"Pair from chisq.test",
"X-squared"
],
"rows": [
[
"Control vs Group 1",
"9.4944"
],
[
"Control vs Group 2",
"4.6895"
],
[
"Control vs Group 3",
"18.234"
],
[
"Group 1 vs Group 2",
"0.64312"
],
[
"Group 1 vs Group 3",
"1.4982"
],
[
"Group 2 vs Group 3",
"4.2807"
]
]
},
"steps": [
{
"say": "This is multiple pairwise chi-square tests with the Holm correction. Each pair of groups is its own 2 by 2 table of survived and died.",
"work": []
},
{
"say": "The question asks only which treatments differ from the control. So keep the three control comparisons and drop the three group versus group results.",
"work": [
"k=3"
]
},
{
"say": "There is no difference in 30-day mortality between the control and Group 1, AND none between the control and Group 2, AND none between the control and Group 3.",
"work": []
},
{
"say": "Every subtable is 2 by 2, so each comparison has 1 degree of freedom.",
"work": [
"\\nu=(2-1)(2-1)=1"
]
},
{
"say": "Control versus Group 3 is largest, then Group 1, then Group 2. The strongest result gets the tightest level.",
"work": [
"\\chi^2_{C,3}=18.234>\\chi^2_{C,1}=9.4944>\\chi^2_{C,2}=4.6895",
"\\alpha_j=\\frac{\\alpha_T}{k-j+1}",
"\\alpha_1=\\frac{0.05}{3-1+1}=0.01667,\\quad \\alpha_2=\\frac{0.05}{3-2+1}=0.025,\\quad \\alpha_3=\\frac{0.05}{3-3+1}=0.05"
]
},
{
"say": "The table has no 0.0167 column, so its cutoff sits between the printed 0.025 and 0.01 values on the 1 degree of freedom row.",
"work": [
"\\chi^2_{0.025}(1)=5.024<\\chi^2_{0.0167}(1)<\\chi^2_{0.01}(1)=6.635"
]
},
{
"say": "18.234 clears even 6.635, and 9.4944 and 4.6895 clear their cutoffs too. No comparison fails, so all three nulls are rejected.",
"work": [
"\\chi^2_{C,3}=18.234>6.635>\\chi^2_{0.0167}(1)\\ \\text{reject}",
"\\chi^2_{C,1}=9.4944>5.024=\\chi^2_{0.025}(1)\\ \\text{reject}",
"\\chi^2_{C,2}=4.6895>3.841=\\chi^2_{0.05}(1)\\ \\text{reject}"
]
},
{
"say": "There is a difference in 30-day mortality between the control and Group 3, AND between the control and Group 1, AND between the control and Group 2. This whole statement holds with P less than 0.05.",
"work": [
"P<0.05"
]
}
]
}
},
{
"title": "Goodness of fit",
"when": "The problem compares one set of category counts with stated proportions.",
"steps": [
{
"do": "Multiply each stated proportion by the total to get expected counts.",
"why": "This is because that is what the stated proportions predict."
},
{
"do": "Add up the chi-square contributions.",
"why": "This is because the statistic is built the same way."
},
{
"do": "Use the number of categories minus 1 for the degrees of freedom.",
"why": "This is because the counts must add up to the total.",
"table": "Use the class chi-square table (upper tail). Read the row for the degrees of freedom and the column for alpha. For 1 degree of freedom at 0.05 the printed value is 3.841.",
"tablePath": "sources/tables/Chi_Squared_Table2.pdf"
}
],
"example": {
"source": "Session 12 lecture example (pages 23 and 24)",
"prompt": "Before a health campaign, 60% of graduating seniors reported no regular exercise, 25% sporadic exercise and 15% regular exercise. Four years later the seniors gave the counts below. Is there a difference in exercise behavior after the campaign?",
"table": {
"headers": [
"",
"No regular exercise",
"Sporadic exercise",
"Regular exercise",
"Total"
],
"rows": [
[
"Number of students",
"255",
"125",
"90",
"470"
]
]
},
"steps": [
{
"say": "Multiply each old proportion by the 470 new seniors. These are the counts expected if nothing changed.",
"work": [
"E_i=p_{i,\\mathrm{Exp}}\\cdot N",
"E_1=470\\cdot 0.60=282,\\quad E_2=470\\cdot 0.25=117.5,\\quad E_3=470\\cdot 0.15=70.5"
]
},
{
"say": "Each category gives one standardized gap, and the three gaps add up to 8.457.",
"work": [
"\\chi^2=\\sum_{i=1}^{k}\\frac{(O_i-E_i)^2}{E_i}",
"\\chi^2=\\frac{(255-282)^2}{282}+\\frac{(125-117.5)^2}{117.5}+\\frac{(90-70.5)^2}{70.5}",
"\\chi^2=2.5851+0.4787+5.3936=8.457"
]
},
{
"say": "There are 3 categories, so there are 2 degrees of freedom. Because 8.457 passes 7.378 but not 9.210, reject the null with P between 0.01 and 0.025, so exercise behavior has changed.",
"work": [
"\\nu=k-1=3-1=2",
"\\chi^2_{0.05}(2)=5.991,\\quad \\chi^2_{0.025}(2)=7.378,\\quad \\chi^2_{0.01}(2)=9.210",
"\\chi^2_{0.025}(2)=7.378<\\chi^2=8.457<9.210=\\chi^2_{0.01}(2)",
"\\text{reject } H_0,\\ 0.01<P<0.025"
]
}
]
}
}
]
},
{
"id": 13,
"tier": "asked",
"title": "How strong an association is",
"lead": "After a test shows a difference, relative risk, odds ratios and NNT describe how large it is.",
"topics": [
{
"title": "Study design decides the measure",
"blocks": [
{
"pages": [
3,
12
],
"main": "**A prospective study follows people forward from exposure, so it can measure risk directly.** A **case-control** study starts from people who already have the disease and looks back at exposure. In a case-control study the researcher chose how many cases to include, so the disease rate in the sample is not real, and only an odds ratio can be used.",
"end": "So the first decision is whether the study was prospective or retrospective."
}
]
},
{
"title": "Relative risk and absolute differences",
"blocks": [
{
"pages": [
5,
6,
7
],
"main": "**Relative risk divides the event rate in the exposed or treated group by the event rate in the comparison group.** A relative risk of 2 means the event is twice as likely. A relative risk of 1 means no difference.",
"sub": [
"The absolute difference subtracts the two rates instead, so it shows how many people out of 100 are actually affected."
]
},
{
"pages": [
8,
9,
10,
11
],
"main": "**The number needed to treat (NNT) is 1 divided by the absolute reduction in risk.** It says how many people must be treated to prevent one event. The number needed to harm (NNH) works the same way for a side effect.",
"sub": [
"A large relative reduction can still be a tiny absolute benefit when the event is rare."
]
}
]
},
{
"title": "Odds ratios",
"blocks": [
{
"pages": [
13,
14,
15,
16
],
"main": "**The odds ratio divides the odds of disease in the exposed group by the odds in the unexposed group.** Odds are the number with the event divided by the number without it. In a two-by-two table this works out to the cross product, exposed with disease times unexposed without, divided by unexposed with disease times exposed without.",
"end": "So the answer sentence says how many times greater the odds are for the exposed group."
}
]
}
],
"questions": [
{
"q": "Why can you not calculate relative risk from a case-control study?",
"a": "You cannot because the researcher chose how many people with the disease to include. That makes the disease rate in the sample artificial, so risks cannot be estimated, but the odds ratio still works."
},
{
"q": "How do you write an odds ratio for a newspaper reader?",
"a": "You write one plain sentence that names the groups and the outcome. For example, the odds of getting prostate cancer were about 1.5 times greater for men who smoke than for men who do not smoke."
},
{
"q": "What does an NNT of 50 mean?",
"a": "It means 50 people must be treated to prevent one event. It comes from 1 divided by the absolute reduction in risk, so a small absolute benefit gives a large NNT."
}
],
"memorize": [
{
"title": "Relative risk with a sentence",
"when": "The study followed people forward, and the question asks how strong the association is.",
"steps": [
{
"do": "Say the study is prospective, so relative risk can be used.",
"why": "This is because risk needs real event rates."
},
{
"do": "Label the exposed or treated row and the event column, taking the exposure from the question's wording even when it is an absence, like not taking folate.",
"why": "This is because the ratio must go the right way round."
},
{
"do": "Divide each group's event count by that group's total.",
"why": "This is because risk is a rate within a group."
},
{
"do": "Divide the exposed risk by the comparison risk.",
"why": "This is because relative risk compares the two rates.",
"tex": "RR=\\frac{n_{TD}/n_T}{n_{CD}/n_C}"
},
{
"do": "Write one plain sentence with the number, the groups and the outcome.",
"why": "This is because the answer is for a non-expert."
}
],
"example": {
"source": "Homework 2 Problem 2(b)",
"prompt": "1000 expectant mothers reported whether they took folate supplements, and their infants were checked for neural tube defects (NTDs). A \\(\\chi^2\\) test found a difference (\\(P<0.01\\)). Quantify the association between the mother not taking folate and NTDs in one sentence a newspaper reader could follow.",
"table": {
"headers": [
"",
"No NTD",
"Yes NTD",
"Total"
],
"rows": [
[
"Took folate",
"471",
"4",
"475"
],
[
"No folate",
"498",
"27",
"525"
]
]
},
"steps": [
{
"say": "The mothers were enrolled during pregnancy and the infants were checked afterwards. So the study is prospective, and relative risk can be used.",
"work": []
},
{
"say": "The question is about not taking folate, so the No folate row is the exposed row. Having an NTD is the event column.",
"work": [
"n_{TD}=27,\\quad n_T=525\\quad(\\text{no folate})",
"n_{CD}=4,\\quad n_C=475\\quad(\\text{took folate})"
]
},
{
"say": "About 5.1 percent of infants had an NTD when the mother took no folate, against about 0.84 percent when she did.",
"work": [
"\\hat p_T=\\frac{n_{TD}}{n_T}=\\frac{27}{525}=0.05143",
"\\hat p_C=\\frac{n_{CD}}{n_C}=\\frac{4}{475}=0.008421"
]
},
{
"say": "The no folate risk is about six times the folate risk.",
"work": [
"RR=\\frac{n_{TD}/n_T}{n_{CD}/n_C}",
"RR=\\frac{27/525}{4/475}=\\frac{0.05143}{0.008421}=6.107"
]
},
{
"say": "The risk that an infant develops one or more NTDs is about 6.1 times greater when the mother did not take folate than when she did.",
"work": []
}
]
}
},
{
"title": "Odds ratio with a sentence",
"when": "The study started from people with and without the disease and looked back at exposure.",
"steps": [
{
"do": "Say the study is retrospective, so you use an odds ratio and not relative risk.",
"why": "This is because the disease rate in the sample was chosen by the researcher."
},
{
"do": "Label the four cells by exposure and disease.",
"why": "This is because the cross product needs the right cells."
},
{
"do": "Multiply exposed with disease by unexposed without, and divide by unexposed with disease times exposed without.",
"why": "This is because that is the ratio of the two odds.",
"tex": "OR=\\frac{n_{ED}\\,n_{UN}}{n_{UD}\\,n_{EN}}"
},
{
"do": "Write one plain sentence about the odds.",
"why": "This is because the answer is for a newspaper reader."
}
],
"example": {
"source": "Exam 1 Question 7",
"prompt": "Men with prostate cancer from a hospital database were cases, and matched men without prostate cancer were controls, in a retrospective case-control study. A \\(\\chi^2\\) test found a difference (\\(P<0.01\\)). Quantify the association between smoking and prostate cancer in one sentence a newspaper reader could follow.",
"table": {
"headers": [
"",
"With cancer",
"Without cancer"
],
"rows": [
[
"Smokers",
"120",
"180"
],
[
"Non smokers",
"130",
"298"
]
]
},
"steps": [
{
"say": "The men were chosen because they did or did not have cancer, and then their smoking was looked up. So the study is retrospective and needs an odds ratio, not relative risk.",
"work": []
},
{
"say": "Smoking is the exposure and prostate cancer is the disease, so each count gets its exposure letter and its disease letter.",
"work": [
"n_{ED}=120,\\quad n_{EN}=180",
"n_{UD}=130,\\quad n_{UN}=298"
]
},
{
"say": "Multiply the smokers with cancer by the non smokers without cancer, then divide by the other cross product.",
"work": [
"OR=\\frac{n_{ED}\\,n_{UN}}{n_{UD}\\,n_{EN}}",
"OR=\\frac{120\\cdot 298}{130\\cdot 180}=\\frac{35760}{23400}=1.528"
]
},
{
"say": "The odds of getting prostate cancer are about 1.5 times greater for men who smoke than for men who do not smoke.",
"work": []
}
]
}
},
{
"title": "Number needed to treat",
"when": "You are asked how many people must be treated to prevent one event.",
"steps": [
{
"do": "Find each group's event rate.",
"why": "This is because NNT uses the absolute difference."
},
{
"do": "Subtract the treated rate from the control rate.",
"why": "This is because that is the absolute reduction."
},
{
"do": "Divide 1 by that reduction and round up.",
"why": "This is because you cannot treat part of a person.",
"tex": "NNT=\\frac{1}{p_C-p_T}"
}
],
"example": {
"source": "Session 13 lecture example (pages 6 to 9)",
"prompt": "People on dialysis were given placebo or aspirin. In the placebo group 18 of 25 developed thrombi, and in the aspirin group 6 of 19 did. How many people must be treated with aspirin for one more person to avoid a thrombus?",
"table": {
"headers": [
"",
"Developed thrombi",
"Free of thrombi",
"Treated"
],
"rows": [
[
"Placebo",
"18",
"7",
"25"
],
[
"Aspirin",
"6",
"13",
"19"
]
]
},
"steps": [
{
"say": "Divide each group's thrombus count by its group size. About 72 percent of the placebo group and 32 percent of the aspirin group developed thrombi.",
"work": [
"\\hat p_{asp}=\\frac{n_{TD}}{n_T}=\\frac{6}{19}=0.3158",
"\\hat p_{pla}=\\frac{n_{CD}}{n_C}=\\frac{18}{25}=0.7200"
]
},
{
"say": "Aspirin lowers the thrombus rate by about 40 percentage points.",
"work": [
"\\hat p_{pla}-\\hat p_{asp}=0.7200-0.3158=0.4042"
]
},
{
"say": "One over 0.4042 is 2.474, or about 2.5 people. A part of a person cannot be treated, so rounding up gives 3.",
"work": [
"NNT=\\frac{1}{p_C-p_T}",
"NNT=\\frac{1}{0.4042}=2.474",
"NNT=3\\ \\text{(rounded up)}"
]
}
]
}
},
{
"title": "Number needed to harm",
"when": "A treatment raises the rate of a side effect and the question asks how many people must be treated for one extra harm.",
"steps": [
{
"do": "Find the side-effect rate in each group.",
"why": "This is because NNH uses the absolute increase."
},
{
"do": "Subtract the control rate from the treated rate.",
"why": "This is because that is the absolute increase in harm."
},
{
"do": "Divide 1 by that increase and round up.",
"why": "This is because you cannot treat part of a person.",
"tex": "NNH=\\frac{1}{p_T-p_C}"
}
],
"example": {
"source": "Practice example",
"prompt": "In a trial, 8 of 100 patients on a drug and 3 of 100 patients on placebo had a serious side effect. How many patients must take the drug for one extra patient to be harmed?",
"table": {
"headers": [
"",
"Side effect",
"No side effect",
"Total"
],
"rows": [
[
"Drug",
"8",
"92",
"100"
],
[
"Placebo",
"3",
"97",
"100"
]
]
},
"steps": [
{
"say": "Divide each side effect count by the group size, so the drug group rate is 8 percent and the placebo rate is 3 percent.",
"work": [
"p_T=\\frac{8}{100}=0.08",
"p_C=\\frac{3}{100}=0.03"
]
},
{
"say": "The drug raises the side effect rate by 5 percentage points.",
"work": [
"p_T-p_C=0.08-0.03=0.05"
]
},
{
"say": "One over 0.05 is exactly 20, so no rounding is needed. For every 20 patients who take the drug, one extra patient has the side effect.",
"work": [
"NNH=\\frac{1}{p_T-p_C}",
"NNH=\\frac{1}{0.05}=20"
]
}
]
}
}
]
},
{
"id": 14,
"tier": "out",
"title": "Errors in decisions and the power of a test",
"lead": "Every test can make two kinds of mistakes, and power is the chance of catching a real effect.",
"topics": [
{
"title": "Two kinds of error",
"blocks": [
{
"pages": [
5,
6
],
"main": "**A Type I error is a false positive, and a Type II error is a missed real effect.** The significance level alpha is the chance of a Type I error when there is no effect. Beta is the chance of a Type II error when there is an effect.",
"end": "So making one error less likely usually makes the other more likely."
},
{
"pages": [
8,
9
],
"main": "**Which error matters more depends on the consequences in the real problem.** Missing a dangerous cholesterol level and wrongly worrying families have different costs."
}
]
},
{
"title": "What raises power",
"blocks": [
{
"pages": [
7,
10,
11,
13,
14
],
"main": "**Power is the chance that the test detects a real effect of a given size.** Power goes up when the effect is bigger, when the population is less variable, when the sample is larger, and when alpha is less strict.",
"sub": [
"A stricter alpha makes the cutoff farther out, so fewer real effects pass it."
]
},
{
"pages": [
16,
17,
18,
19
],
"main": "**The power chart combines the effect size and the spread into one value, phi, which is the effect divided by the SD.** You read power from the curve for your sample size. You can also go the other way and find the sample size needed for a target power like 0.8."
}
]
}
],
"questions": [
{
"q": "What is the difference between a Type I and a Type II error?",
"a": "A Type I error is saying there is an effect when there is none. A Type II error is missing an effect that is really there. Alpha is the chance of the first, and beta is the chance of the second."
},
{
"q": "Why does a larger sample increase power?",
"a": "A larger sample makes the standard error smaller. The same real difference then gives a bigger t, so it is more likely to pass the cutoff."
}
],
"memorize": [
{
"title": "Read power or sample size from the chart",
"when": "You are asked for the power of a t test or the n needed.",
"steps": [
{
"do": "Find the effect size you want to detect.",
"why": "This is because power depends on the size of the effect."
},
{
"do": "Find the SD from the pooled variance.",
"why": "This is because the effect is judged against the spread."
},
{
"do": "Divide the effect by the SD to get phi.",
"why": "This is because the chart is organized by phi.",
"tex": "\\phi=\\frac{\\delta}{\\sigma}"
},
{
"do": "Read power from the curve for your n, or find the n whose curve reaches the target power.",
"why": "This is because the chart links phi, n and power.",
"table": "Use the class power chart for the t test, posted with the statistical tables.",
"tablePath": null
}
],
"example": {
"source": "Session 14 lecture example (pages 17 and 18)",
"prompt": "Halothane (\\(n=9\\), mean 2.08, SD 1.05) and morphine (\\(n=16\\), mean 1.75, SD 0.88) were compared for best cardiac index in \\(\\mathrm{L/min/m^2}\\), and the difference was not significant. What is the power to detect a difference in cardiac index of \\(2.08-1.75=0.33\\) with \\(\\alpha=0.05\\)?",
"table": {
"headers": [
"",
"Halothane",
"Morphine"
],
"rows": [
[
"n",
"9",
"16"
],
[
"Mean",
"2.08",
"1.75"
],
[
"SD",
"1.05",
"0.88"
]
]
},
"steps": [
{
"say": "The effect to detect is the gap between the two group means.",
"work": [
"\\delta=\\bar x_1-\\bar x_2=2.08-1.75=0.33"
]
},
{
"say": "Pool the two variances, weighting each by its degrees of freedom, and take the square root to get the SD.",
"work": [
"s^2=\\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}",
"s^2=\\frac{(9-1)(1.05)^2+(16-1)(0.88)^2}{9+16-2}=\\frac{8.820+11.616}{23}=0.8885",
"s=\\sqrt{0.8885}=0.9426"
]
},
{
"say": "The difference is only about a third of an SD, so it is a small effect.",
"work": [
"\\phi=\\frac{\\delta}{\\sigma}\\approx\\frac{\\delta}{s}",
"\\phi=\\frac{0.33}{0.9426}=0.3501\\approx 0.35"
]
},
{
"say": "Use n of 9 because the smaller group limits the power. At phi of 0.35 the curves sit at about 0.1, so the study had only about a 10 percent chance of finding this difference.",
"work": [
"n=9\\ (\\text{smaller group}),\\quad \\alpha=0.05",
"\\text{Power}\\approx 0.1"
]
}
]
}
}
]
},
{
"id": 17,
"tier": "m2",
"title": "Confidence intervals",
"lead": "A confidence interval gives a range of believable values for a population quantity, and it also answers the test question.",
"topics": [
{
"title": "What 95 percent confidence means",
"blocks": [
{
"pages": [
1,
3,
7
],
"main": "**A 95 percent confidence interval is built by a method that captures the true value in 95 percent of samples.** Any one interval either contains the true value or it does not. The 95 percent describes how often the method works over many samples.",
"end": "So the confidence belongs to the method, not to one particular interval."
}
]
},
{
"title": "Building an interval",
"blocks": [
{
"pages": [
2,
4,
5,
9
],
"main": "**Every interval is the estimate plus or minus a margin, and the margin is the cutoff times the standard error.** The estimate sits in the middle. The cutoff comes from the two-tailed t table for the confidence level and the degrees of freedom.",
"sub": [
"For one mean, the standard error is the SD over the square root of n with n minus 1 degrees of freedom.",
"For two means, the standard error uses the pooled variance with n1 plus n2 minus 2 degrees of freedom."
],
"end": "So a wider interval means more uncertainty, and a 99 percent interval is wider than a 95 percent one."
},
{
"pages": [
11,
13
],
"main": "**Intervals for proportions use the Normal cutoff from the infinity row of the t table.** For the difference of two proportions, the course method uses the pooled proportion inside the standard error."
}
]
},
{
"title": "Using an interval to decide",
"blocks": [
{
"pages": [
8,
15,
16
],
"main": "**If a 95 percent interval for a difference does not contain zero, the difference is significant with P less than 0.05.** Zero is the value that means no difference. When the interval leaves it out, no difference is not a believable value.",
"sub": [
"A 99 percent interval that leaves out zero gives P less than 0.01, because the wider interval is a stricter test.",
"For one proportion, the reference value is whatever the null hypothesis states, such as one half."
]
}
]
}
],
"questions": [
{
"q": "What does it mean to be 95 percent confident?",
"a": "It means the method used to build the interval captures the true value in 95 percent of samples. Any one interval either contains the true value or it does not."
},
{
"q": "How can a confidence interval tell you whether a difference is significant?",
"a": "You check whether the interval for the difference contains zero. If a 95 percent interval leaves zero out, the difference is significant with P less than 0.05, because no difference is not a believable value."
},
{
"q": "Why is a 99 percent interval wider than a 95 percent interval?",
"a": "It is wider because it must capture the true value more often. A larger cutoff is used, so the margin of error is bigger."
}
],
"memorize": [
{
"title": "Confidence interval for one mean",
"when": "One group has a mean, SD and n, and the question asks for an interval for the population mean.",
"steps": [
{
"do": "Divide the SD by the square root of n to get the standard error.",
"why": "This is because the margin is built from the uncertainty in the mean.",
"tex": "s_{\\bar x}=\\frac{s}{\\sqrt n}"
},
{
"do": "Find the two-tailed t cutoff with n minus 1 degrees of freedom.",
"why": "This is because the SD was estimated from the sample.",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "Add and subtract the margin from the sample mean.",
"why": "This is because the interval is the estimate plus or minus the margin.",
"tex": "\\bar x\\pm t_c\\,\\frac{s}{\\sqrt n}"
},
{
"do": "Interpret the interval in the measurement's units.",
"why": "This is because the answer is about the population mean."
}
],
"example": {
"source": "Session 17 lecture example (page 10)",
"prompt": "Ten BME 423 students have a mean heart rate of 67 beats/min with a sample SD of 9 beats/min. Find the 95% confidence interval for the population mean heart rate \\(\\mu_{HR}\\).",
"table": {
"headers": [
"\\(n\\)",
"\\(\\bar x\\) (beats/min)",
"\\(s\\) (beats/min)"
],
"rows": [
[
"10",
"67",
"9"
]
]
},
"steps": [
{
"say": "The SD of 9 beats/min is divided by the square root of 10. So the mean of ten students is uncertain by about 2.846 beats/min.",
"work": [
"s_{\\bar x}=\\frac{s}{\\sqrt n}",
"s_{\\bar x}=\\frac{9}{\\sqrt{10}}=\\frac{9}{3.162278}=2.846050"
]
},
{
"say": "Row 9 and the two-tailed 0.05 column of the t table give 2.262. That column already holds both tails, so it is not halved again.",
"work": [
"\\nu=n-1=10-1=9",
"\\alpha=1-0.95=0.05",
"t_{0.05}(9)=2.262"
]
},
{
"say": "The margin is the cutoff times the standard error, about 6.44 beats/min. Taking it off 67 gives the lower end and adding it gives the upper end.",
"work": [
"\\bar x\\pm t_c\\,\\frac{s}{\\sqrt n}",
"M=2.262(2.846050)=6.437765",
"L=67-6.437765=60.56224",
"U=67+6.437765=73.43776"
]
},
{
"say": "We are 95% confident that the mean heart rate of all BME 423 students is between about 60.6 and 73.4 beats/min. This range is for the mean, not for single students.",
"work": [
"60.56224<\\mu_{HR}<73.43776\\ \\text{beats/min}"
]
}
]
}
},
{
"title": "Confidence interval for a difference of two means",
"when": "The problem gives two independent groups, each with a mean, SD and n.",
"steps": [
{
"do": "Write the difference of the sample means.",
"why": "This is because it is the center of the interval."
},
{
"do": "Pool the variances and find the standard error of the difference.",
"why": "This is because the margin is built from it.",
"tex": "s_{\\bar x_1-\\bar x_2}=\\sqrt{s_p^2\\left(\\frac1{n_1}+\\frac1{n_2}\\right)}"
},
{
"do": "Find the two-tailed t cutoff for the confidence level with n1 plus n2 minus 2 degrees of freedom.",
"why": "This is because the cutoff sets the width.",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "Add and subtract the margin.",
"why": "This is because the interval is the estimate plus or minus the margin.",
"tex": "(\\bar x_1-\\bar x_2)\\pm t_c\\, s_{\\bar x_1-\\bar x_2}"
},
{
"do": "Interpret the interval in the units of the measurement.",
"why": "This is because the answer is about the population difference."
}
],
"example": {
"source": "Session 17 lecture example (page 6)",
"prompt": "Daily urine production is compared between a diuretic group and a placebo group. Assume Normal responses with a common variance. Find the 95% confidence interval for \\(\\mu_{\\mathrm{diuretic}}-\\mu_{\\mathrm{placebo}}\\).",
"table": {
"headers": [
"Group",
"\\(n\\)",
"\\(\\bar x\\) (mL/day)",
"\\(s\\) (mL/day)"
],
"rows": [
[
"Diuretic (1)",
"10",
"1400",
"245"
],
[
"Placebo (2)",
"10",
"1180",
"144"
]
]
},
"steps": [
{
"say": "Diuretic minus placebo is 220 mL/day. This order is kept to the end so the sign of the interval keeps its meaning.",
"work": [
"\\bar x_1-\\bar x_2=1400-1180=220"
]
},
{
"say": "Each variance is weighted by its own 9 degrees of freedom before pooling. The pooled variance then gives a standard error of about 89.87 mL/day.",
"work": [
"s_{\\bar x_1-\\bar x_2}=\\sqrt{s_p^2\\left(\\frac1{n_1}+\\frac1{n_2}\\right)},\\quad s_p^2=\\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}",
"s_p^2=\\frac{9(245^2)+9(144^2)}{10+10-2}=\\frac{540225+186624}{18}=40380.5",
"s_{\\bar x_1-\\bar x_2}=\\sqrt{40380.5\\left(\\frac1{10}+\\frac1{10}\\right)}=\\sqrt{8076.1}=89.86712"
]
},
{
"say": "Row 18 and the two-tailed 0.05 column of the t table give 2.101.",
"work": [
"\\nu=n_1+n_2-2=10+10-2=18",
"t_{0.05}(18)=2.101"
]
},
{
"say": "The margin is about 188.8 mL/day. It is taken off and added to the difference of 220 mL/day.",
"work": [
"(\\bar x_1-\\bar x_2)\\pm t_c\\, s_{\\bar x_1-\\bar x_2}",
"M=2.101(89.86712)=188.8108",
"L=220-188.8108=31.1892",
"U=220+188.8108=408.8108"
]
},
{
"say": "We are 95% confident that the diuretic raises mean urine production by between about 31 and 409 mL/day. Zero is outside the interval, so the diuretic does change urine production.",
"work": [
"31.19<\\mu_{\\mathrm{diuretic}}-\\mu_{\\mathrm{placebo}}<408.81\\ \\text{mL/day}"
]
}
]
}
},
{
"title": "Confidence interval for one proportion",
"when": "A survey or sample gives a count with an event, and the question asks for an interval for the population proportion.",
"steps": [
{
"do": "Calculate the sample proportion.",
"why": "This is because it is the center of the interval."
},
{
"do": "Calculate the standard error from the proportion and n.",
"why": "This is because the margin is built from it.",
"tex": "s_{\\hat p}=\\sqrt{\\frac{\\hat p(1-\\hat p)}{n}}"
},
{
"do": "Use the infinity row cutoff and add and subtract the margin.",
"why": "This is because proportions use the Normal distribution.",
"tex": "\\hat p\\pm z_c\\,s_{\\hat p}",
"table": "Use the class t table, infinity row on PDF page 2. The 0.05 column gives 1.96 and the 0.01 column gives 2.576.",
"tablePath": "sources/tables/t_table.pdf#page=2"
},
{
"do": "Check whether the null value, like one half, lies inside the interval.",
"why": "This is because that decides the matching two-sided test."
}
],
"example": {
"source": "Session 17 lecture example (pages 14 and 15)",
"prompt": "A survey asked college students “Did you take a non-prescribed stimulant in the last year?” Of the 500 students who responded, 177 said yes. Find the 95% confidence interval for the population proportion and decide whether it differs from 0.5.",
"table": {
"headers": [
"Said yes \\(m\\)",
"Responded \\(n\\)",
"Null value \\(p_0\\)"
],
"rows": [
[
"177",
"500",
"0.5"
]
]
},
"steps": [
{
"say": "177 of the 500 students said yes. So the sample proportion is 0.354.",
"work": [
"\\hat p=\\frac{m}{n}=\\frac{177}{500}=0.354"
]
},
{
"say": "The proportion times one minus the proportion is divided by 500. The square root gives a standard error of about 0.0214.",
"work": [
"s_{\\hat p}=\\sqrt{\\frac{\\hat p(1-\\hat p)}{n}}",
"s_{\\hat p}=\\sqrt{\\frac{0.354(1-0.354)}{500}}=\\sqrt{\\frac{0.228684}{500}}=\\sqrt{0.000457368}=0.02138616"
]
},
{
"say": "The infinity row and the 0.05 column of the t table give 1.96. So the interval runs from about 0.312 to 0.396.",
"work": [
"z_c=t_{0.05}(\\infty)=1.9600",
"\\hat p\\pm z_c\\,s_{\\hat p}",
"M=1.96(0.02138616)=0.04191688",
"L=0.354-0.04191688=0.3120831",
"U=0.354+0.04191688=0.3959169"
]
},
{
"say": "One half lies above the whole interval. So the proportion of students who took a stimulant differs from 0.5 at the 0.05 level, and it is lower.",
"work": [
"0.3121<p<0.3959",
"p_0=0.5\\notin[0.3121,\\ 0.3959]"
]
}
]
}
},
{
"title": "Confidence interval for a difference of two proportions",
"when": "The problem gives two groups with yes-or-no outcomes and asks for an interval for the difference.",
"steps": [
{
"do": "Calculate each group's proportion and their difference.",
"why": "This is because the difference is the center."
},
{
"do": "Calculate the pooled proportion and the standard error.",
"why": "This is because the course method pools the two groups.",
"tex": "s_{\\hat p_1-\\hat p_2}=\\sqrt{\\hat p(1-\\hat p)\\left(\\frac1{n_1}+\\frac1{n_2}\\right)}"
},
{
"do": "Use the infinity row cutoff for the confidence level.",
"why": "This is because proportions use the Normal distribution.",
"table": "Use the class t table, infinity row on PDF page 2. The 0.05 column gives 1.96 and the 0.01 column gives 2.576.",
"tablePath": "sources/tables/t_table.pdf#page=2"
},
{
"do": "Add and subtract the margin.",
"why": "This is because the interval is the estimate plus or minus the margin.",
"tex": "(\\hat p_1-\\hat p_2)\\pm z_c\\, s_{\\hat p_1-\\hat p_2}"
},
{
"do": "Say the interval in percentage points.",
"why": "This is because a difference of proportions is measured in points."
}
],
"example": {
"source": "Session 17 lecture example (page 12)",
"prompt": "A trial records thrombosis with placebo and with aspirin. Find the 95% confidence interval for the difference in the probability of thrombosis, placebo minus aspirin, using the pooled standard error.",
"table": {
"headers": [
"Group",
"Thrombosis \\(m\\)",
"Total \\(n\\)"
],
"rows": [
[
"Placebo (1)",
"18",
"25"
],
[
"Aspirin (2)",
"6",
"19"
]
]
},
"steps": [
{
"say": "Group 1 is placebo and group 2 is aspirin. The difference is placebo minus aspirin, so a positive value means more thrombosis with placebo.",
"work": [
"\\hat p_1=\\frac{18}{25}=0.72,\\quad \\hat p_2=\\frac{6}{19}=0.3157895",
"\\hat p_1-\\hat p_2=0.72-0.3157895=0.4042105"
]
},
{
"say": "The counts and the sizes are added first to get the pooled proportion. That pooled value goes into the standard error, which is about 0.1515.",
"work": [
"s_{\\hat p_1-\\hat p_2}=\\sqrt{\\hat p(1-\\hat p)\\left(\\frac1{n_1}+\\frac1{n_2}\\right)},\\quad \\hat p=\\frac{m_1+m_2}{n_1+n_2}",
"\\hat p=\\frac{18+6}{25+19}=\\frac{24}{44}=0.5454545",
"s_{\\hat p_1-\\hat p_2}=\\sqrt{0.5454545(1-0.5454545)\\left(\\frac1{25}+\\frac1{19}\\right)}=\\sqrt{0.2479339(0.09263158)}=0.1515470"
]
},
{
"say": "Proportions use the Normal distribution, so the cutoff comes from the infinity row of the t table in the 0.05 column.",
"work": [
"z_c=t_{0.05}(\\infty)=1.9600"
]
},
{
"say": "The margin is about 0.297. So the interval runs from about 0.107 to 0.701.",
"work": [
"(\\hat p_1-\\hat p_2)\\pm z_c\\, s_{\\hat p_1-\\hat p_2}",
"M=1.96(0.1515470)=0.2970322",
"L=0.4042105-0.2970322=0.1071783",
"U=0.4042105+0.2970322=0.7012427"
]
},
{
"say": "With 95% confidence, aspirin lowers the chance of thrombosis by about 10.7 to 70.1 percentage points compared with placebo. Zero is outside, so the two probabilities differ.",
"work": [
"10.72<100(p_1-p_2)<70.12\\ \\text{percentage points}"
]
}
]
}
},
{
"title": "Decide significance from intervals only",
"when": "You are asked whether a difference is significant using only the intervals.",
"steps": [
{
"do": "Look at whether the 95 percent interval contains zero.",
"why": "This is because zero means no difference."
},
{
"do": "If it leaves zero out, say the difference is significant with P less than 0.05.",
"why": "This is because no difference is outside the believable range."
},
{
"do": "Repeat with the 99 percent interval for P less than 0.01.",
"why": "This is because the wider interval is the stricter test."
},
{
"do": "For one proportion, check whether the null value, like one half, lies inside the interval.",
"why": "This is because the reference value is not always zero."
},
{
"do": "Say how you reached each conclusion.",
"why": "This is because the question asks you to explain the reasoning."
}
],
"example": {
"source": "Homework 3 Problem 1",
"prompt": "Six-month survival after heart-transplant surgery is compared between two ways of transporting the heart. Find the 95% and 99% confidence intervals for the difference in the proportion alive at 6 months. Using only these intervals, is the difference significant with \\(P<0.05\\)? With \\(P<0.01\\)? State how you reached each conclusion.",
"table": {
"headers": [
"Group",
"Alive at 6 months",
"Not alive at 6 months",
"Total"
],
"rows": [
[
"Warm and beating (1)",
"82",
"11",
"93"
],
[
"Stopped and on ice (2)",
"72",
"26",
"98"
]
]
},
"steps": [
{
"say": "The 95% interval uses the pooled standard error and the cutoff 1.96. It runs from about 0.035 to 0.259, so it does not contain zero.",
"work": [
"\\hat p_1=\\frac{82}{93}=0.8817204,\\quad \\hat p_2=\\frac{72}{98}=0.7346939,\\quad \\hat p_1-\\hat p_2=0.1470266",
"\\hat p=\\frac{82+72}{93+98}=\\frac{154}{191}=0.8062827",
"s_{\\hat p_1-\\hat p_2}=\\sqrt{0.8062827(1-0.8062827)\\left(\\frac1{93}+\\frac1{98}\\right)}=0.05721238",
"0.1470266\\pm1.96(0.05721238)=0.1470266\\pm0.1121363",
"0.03489<p_1-p_2<0.2592"
]
},
{
"say": "Zero is outside the 95% interval, so a difference of zero is not a believable value. The difference in survival is significant with P less than 0.05.",
"work": [
"0\\notin[0.03489,\\ 0.2592]\\ \\Rightarrow\\ P<0.05"
]
},
{
"say": "The 99% interval uses 2.5758 from the infinity row and the 0.01 column. Its lower end sits just below zero, so the difference is not significant with P less than 0.01.",
"work": [
"z_c=t_{0.01}(\\infty)=2.5758",
"0.1470266\\pm2.5758(0.05721238)=0.1470266\\pm0.1473677",
"-0.0003411<p_1-p_2<0.2944",
"0\\in[-0.0003411,\\ 0.2944]\\ \\Rightarrow\\ P>0.01"
]
},
{
"say": "This is a difference of two proportions, so the null value is zero and not one half. A single proportion would be checked against its own reference value instead.",
"work": [
"H_0:p_1-p_2=0"
]
},
{
"say": "The 95% interval leaves out zero, so P is below 0.05. The wider 99% interval just includes zero, so P is not below 0.01. The higher survival with warm transport is significant at the 0.05 level only.",
"work": [
"0.01<P<0.05"
]
}
]
}
}
]
},
{
"id": 18,
"tier": "m2",
"title": "Simple linear regression and correlation",
"lead": "Regression finds the straight line that best predicts one variable from another, and it also tells you how uncertain that line is.",
"topics": [
{
"title": "The line of means",
"blocks": [
{
"pages": [
4,
5,
6
],
"main": "**In a population, the mean of the dependent variable changes along a straight line as the independent variable changes.** This line is the **line of means**. Its intercept is alpha and its slope is beta. At each value of x, the values of y are Normal around the line with the same spread, called sigma y given x.",
"sub": [
"The **independent variable** x is the one you set or know, like height. The **dependent variable** y is the one you predict, like weight."
],
"end": "So regression assumes a straight-line trend, Normal scatter and the same scatter at every x."
}
]
},
{
"title": "Fitting the best line",
"blocks": [
{
"pages": [
9,
10,
11,
13,
14,
15
],
"main": "**The regression line is the line that makes the sum of squared vertical errors as small as possible.** Each error is the gap between a measured y and the y the line predicts. Squaring the gaps keeps them positive, so the best line is the one with the smallest total.",
"sub": [
"Setting the derivatives with respect to a and b to zero gives formulas for both, built only from sums of x, y, x squared and x times y.",
"Once b is known, a is the mean of y minus b times the mean of x, so the line always passes through the point of the two means."
],
"end": "So the line y hat equals a plus b x is the sample estimate of the population line of means."
}
]
},
{
"title": "Spread around the line and uncertainty in a and b",
"blocks": [
{
"pages": [
16,
17,
18,
19
],
"main": "**The standard error of the estimate, s y given x, measures how far points usually sit from the regression line.** R calls it the **residual standard error**. It divides the sum of squared errors by n minus 2, because two numbers, a and b, were estimated from the data."
},
{
"pages": [
20
],
"main": "**The intercept and the slope each have their own standard error.** Both grow when the points scatter more around the line. The slope's standard error shrinks when the x values are more spread out, because a wide range of x pins down the slope better."
}
]
},
{
"title": "Testing the trend and building intervals",
"blocks": [
{
"pages": [
21,
22,
23
],
"main": "**To test whether there is a relationship, you test whether the population slope is zero.** A slope of zero means y does not change with x. The t statistic is the slope divided by its standard error, with n minus 2 degrees of freedom.",
"sub": [
"A confidence interval for the slope or intercept is the estimate plus or minus the t cutoff times its standard error."
]
},
{
"pages": [
24,
25
],
"main": "**An interval for the mean y at one value of x is narrower than an interval for one new observation at that x.** The interval for the mean only includes uncertainty about where the line is. The interval for one observation also includes how much single people scatter around the line, so it adds s y given x squared inside the square root.",
"sub": [
"Both intervals are narrowest at the mean of x and widen farther away, because the line is least certain at its ends."
],
"end": "So the question's wording, mean versus one observation, decides which standard error you use."
}
]
},
{
"title": "Comparing two regression lines",
"blocks": [
{
"pages": [
26,
27,
29,
30,
31,
33,
34,
36
],
"main": "**To compare two groups' lines, you test whether their slopes differ with a t test.** The t statistic is the difference in slopes divided by the standard error of that difference. The degrees of freedom are n1 plus n2 minus 4, because each line used up two.",
"sub": [
"When the group sizes differ, the two residual variances are pooled first.",
"The same kind of t test compares the two intercepts."
]
}
]
},
{
"title": "Correlation",
"blocks": [
{
"pages": [
37,
38,
39,
40
],
"main": "**The correlation coefficient r measures how strongly two variables move together on a straight line.** It runs from minus 1 to plus 1. Values near plus 1 mean they rise together, values near minus 1 mean one falls as the other rises, and values near 0 mean no straight-line relationship.",
"sub": [
"Correlation does not need one variable to depend on the other, but regression does."
]
},
{
"pages": [
41
],
"main": "**To test whether r differs from zero, you turn r into a t statistic with n minus 2 degrees of freedom.** A larger r or a larger sample gives a larger t."
}
]
}
],
"questions": [
{
"q": "What is the difference between the confidence interval for the mean at a value of x and the confidence interval for one observation?",
"a": "The interval for the mean is narrower. It only covers uncertainty about where the line of means is. The interval for one observation also covers how much single people scatter around the line, so it adds the residual variance and is wider."
},
{
"q": "Why does s y given x divide by n minus 2?",
"a": "It divides by n minus 2 because two values, the intercept and the slope, were estimated from the same data. Each estimate uses up one degree of freedom."
},
{
"q": "What null hypothesis do you test to decide whether there is a trend?",
"a": "You test whether the population slope beta is zero, which means y does not change with x. In words, there is no relationship between the two variables. You use t equal to b over its standard error with n minus 2 degrees of freedom."
},
{
"q": "How is correlation different from regression?",
"a": "Regression gives the line that predicts the dependent variable and the scatter around it. Correlation only measures how strongly the two variables move together, and it does not need one of them to depend on the other."
}
],
"memorize": [
{
"title": "Fit the line and test the slope by hand",
"when": "The problem gives x and y data or their sums, like HW3 question 2, and says not to use R.",
"steps": [
{
"do": "Name x and y and keep their units.",
"why": "This is because the slope is in y units per x unit."
},
{
"do": "Calculate the slope b from the sums.",
"why": "This is because the least-squares formula only needs these sums.",
"tex": "b=\\frac{n\\sum x_iy_i-\\sum x_i\\sum y_i}{n\\sum x_i^2-\\left(\\sum x_i\\right)^2}"
},
{
"do": "Calculate the intercept a from the two means.",
"why": "This is because the line passes through the point of the two means.",
"tex": "a=\\bar y-b\\,\\bar x"
},
{
"do": "Write the regression line.",
"why": "This is because the first question always asks for it.",
"tex": "\\hat y=a+b\\,x"
},
{
"do": "Calculate s y given x.",
"why": "This is because every standard error after this uses it.",
"tex": "s_{y|x}=\\sqrt{\\frac{n-1}{n-2}\\left(s_y^2-b^2s_x^2\\right)}"
},
{
"do": "Calculate the standard errors of a and b.",
"why": "This is because the tests and intervals for a and b need them.",
"tex": "s_a=s_{y|x}\\sqrt{\\frac1n+\\frac{\\bar x^2}{(n-1)s_x^2}},\\quad s_b=\\frac{1}{\\sqrt{n-1}}\\frac{s_{y|x}}{s_x}"
},
{
"do": "Write the null hypothesis that there is no relationship, then divide b by its standard error.",
"why": "This is because a zero slope means no trend.",
"tex": "t=\\frac{b}{s_b},\\quad \\nu=n-2"
},
{
"do": "Compare with the two-tailed t cutoff and write the conclusion with a P range.",
"why": "This is because the conclusion must say whether the trend is real.",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "If intervals are asked, add and subtract the t cutoff times each standard error.",
"why": "This is because a confidence interval is the estimate plus or minus the margin.",
"tex": "b\\pm t_\\alpha(n-2)\\,s_b,\\quad a\\pm t_\\alpha(n-2)\\,s_a"
}
],
"example": {
"source": "Session 18 lecture example (pages 15 and 19 to 23)",
"prompt": "A sample of 10 Martians gives the heights and weights below (Table 8-1), with \\(\\sum x_i=369\\), \\(\\sum y_i=103.8\\), \\(\\sum x_i^2=13{,}841\\), \\(\\sum x_iy_i=3930.1\\) and \\(\\sum y_i^2=1129.24\\). By hand, find the regression line and the standard errors of \\(a\\) and \\(b\\), test whether weight is related to height, and give 95% intervals for the slope and intercept. The true line of means for all Martians is \\(\\mu_{y|x}=-8+0.5x\\).",
"table": {
"headers": [
"Height \\(x\\) (cm)",
"Weight \\(y\\) (g)"
],
"rows": [
[
"31",
"7.8"
],
[
"32",
"8.3"
],
[
"33",
"7.6"
],
[
"34",
"9.1"
],
[
"35",
"9.6"
],
[
"35",
"9.8"
],
[
"40",
"11.8"
],
[
"41",
"12.1"
],
[
"42",
"14.7"
],
[
"46",
"13.0"
]
]
},
"steps": [
{
"say": "Height is x in cm and weight is y in g. So the slope will be in g per cm and the intercept in g.",
"work": [
"x=\\text{height (cm)},\\quad y=\\text{weight (g)},\\quad n=10"
]
},
{
"say": "The numerator is 998.8 and the denominator is 2249. So mean weight rises about 0.444 g for each extra cm of height.",
"work": [
"b=\\frac{n\\sum x_iy_i-\\sum x_i\\sum y_i}{n\\sum x_i^2-\\left(\\sum x_i\\right)^2}",
"b=\\frac{10(3930.1)-369(103.8)}{10(13841)-369^2}=\\frac{39301-38302.2}{138410-136161}=\\frac{998.8}{2249}=0.4441085"
]
},
{
"say": "The unrounded slope is carried into this step. The intercept comes out near minus 6.01 g.",
"work": [
"a=\\bar y-b\\,\\bar x",
"\\bar x=\\frac{369}{10}=36.9,\\quad \\bar y=\\frac{103.8}{10}=10.38",
"a=10.38-0.4441085(36.9)=-6.007603"
]
},
{
"say": "This is the least-squares line for the ten Martians, with weight in g and height in cm.",
"work": [
"\\hat y=a+b\\,x",
"\\hat y=-6.008+0.4441\\,x"
]
},
{
"say": "The two variances come from the column sums. Rounding the SDs to 5.0 and 2.4 first would give about 1.02 g, because the shortcut subtracts two close numbers.",
"work": [
"s_{y|x}=\\sqrt{\\frac{n-1}{n-2}\\left(s_y^2-b^2s_x^2\\right)}",
"s_x^2=\\frac{13841-369^2/10}{10-1}=\\frac{224.9}{9}=24.98889,\\quad s_x=4.998889",
"s_y^2=\\frac{1129.24-103.8^2/10}{10-1}=\\frac{51.796}{9}=5.755111",
"s_{y|x}=\\sqrt{\\frac{9}{8}\\left(5.755111-0.4441085^2(24.98889)\\right)}=\\sqrt{\\frac{9}{8}(0.826494)}=0.9642642"
]
},
{
"say": "The slope is known to about 0.064 g per cm. The intercept is far less precise because a height of zero is far from the mean height of 36.9 cm.",
"work": [
"s_a=s_{y|x}\\sqrt{\\frac1n+\\frac{\\bar x^2}{(n-1)s_x^2}},\\quad s_b=\\frac{1}{\\sqrt{n-1}}\\frac{s_{y|x}}{s_x}",
"s_b=\\frac{1}{\\sqrt{9}}\\cdot\\frac{0.9642642}{4.998889}=0.06429857",
"s_a=0.9642642\\sqrt{\\frac1{10}+\\frac{36.9^2}{9(24.98889)}}=0.9642642\\sqrt{6.154291}=2.392132"
]
},
{
"say": "The null hypothesis says mean Martian weight does not change with height. The slope is about 6.9 of its standard errors away from zero.",
"work": [
"H_0:\\beta=0,\\quad H_A:\\beta\\ne0",
"t=\\frac{b}{s_b}=\\frac{0.4441085}{0.06429857}=6.906973,\\quad \\nu=10-2=8"
]
},
{
"say": "The statistic is larger than even the 0.001 cutoff in row 8. So we reject the null hypothesis, and taller Martians are heavier on average with P less than 0.001.",
"work": [
"t_{0.05}(8)=2.306,\\quad t_{0.001}(8)=5.041",
"6.907>5.041\\ \\Rightarrow\\ P<0.001"
]
},
{
"say": "The slope interval leaves out zero, which agrees with the test. Both intervals contain the true population values of 0.5 g per cm and minus 8 g.",
"work": [
"b\\pm t_\\alpha(n-2)\\,s_b,\\quad a\\pm t_\\alpha(n-2)\\,s_a",
"0.4441085\\pm2.306(0.06429857)=0.4441085\\pm0.1482725",
"0.2958<\\beta<0.5924\\ \\text{g/cm}",
"-6.007603\\pm2.306(2.392132)=-6.007603\\pm5.516255",
"-11.52<\\alpha_{LOM}<-0.4913\\ \\text{g}"
]
}
]
}
},
{
"title": "Interval for the mean versus one observation at a given x",
"when": "The question asks for a 95 percent interval at one value of x, like a dose of 18.5 mg.",
"steps": [
{
"do": "Plug x into the line to get y hat.",
"why": "This is because both intervals are centered on the predicted value."
},
{
"do": "For the mean, use the standard error of the line at that x.",
"why": "This is because only the position of the line is uncertain.",
"tex": "s_{\\hat y}=s_{y|x}\\sqrt{\\frac1n+\\frac{(x-\\bar x)^2}{(n-1)s_x^2}}"
},
{
"do": "For one observation, add 1 inside the square root.",
"why": "This is because a single person also scatters around the line.",
"tex": "s_{Y_{new}}=s_{y|x}\\sqrt{1+\\frac1n+\\frac{(x-\\bar x)^2}{(n-1)s_x^2}}"
},
{
"do": "Use the t cutoff with n minus 2 degrees of freedom and add and subtract the margin.",
"why": "This is because the interval is the estimate plus or minus the margin.",
"tex": "\\hat y\\pm t_{\\alpha}(n-2)\\,s_{\\hat y}\\ \\text{(mean)},\\quad \\hat y\\pm t_{\\alpha}(n-2)\\,s_{Y_{new}}\\ \\text{(one observation)}",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "Say which interval is wider and why.",
"why": "This is because the comparison is usually part of the question."
}
],
"example": {
"source": "Session 18 lecture example (pages 24 and 25)",
"prompt": "Use the Martian line \\(\\hat y=-6.0+0.44x\\) with \\(s_{y|x}=1.02\\) g, \\(n=10\\), \\(\\bar x=36.9\\) cm and \\(s_x=5.0\\) cm. Find the 95% interval for the mean weight of Martians 40 cm tall, and the 95% interval for the weight of one Martian 40 cm tall.",
"steps": [
{
"say": "The line predicts 11.6 g at 40 cm. Both intervals are centered on this value.",
"work": [
"\\hat y=-6.0+0.44(40)=11.6"
]
},
{
"say": "40 cm is only 3.1 cm from the mean height, so the distance term is small. The height of the line at 40 cm is uncertain by about 0.385 g.",
"work": [
"s_{\\hat y}=s_{y|x}\\sqrt{\\frac1n+\\frac{(x-\\bar x)^2}{(n-1)s_x^2}}",
"s_{\\hat y}=1.02\\sqrt{\\frac1{10}+\\frac{(40-36.9)^2}{9(5.0^2)}}=1.02\\sqrt{0.1427111}=0.3853267"
]
},
{
"say": "The extra 1 adds the scatter of one Martian around the line. So the standard error grows to about 1.09 g.",
"work": [
"s_{Y_{new}}=s_{y|x}\\sqrt{1+\\frac1n+\\frac{(x-\\bar x)^2}{(n-1)s_x^2}}",
"s_{Y_{new}}=1.02\\sqrt{1+0.1427111}=1.02\\sqrt{1.1427111}=1.090356"
]
},
{
"say": "Row 8 of the t table gives 2.306 for both intervals. Only the standard error changes between them.",
"work": [
"\\nu=10-2=8,\\quad t_{0.05}(8)=2.306",
"11.6\\pm2.306(0.3853267)=11.6\\pm0.8885633",
"10.71<\\mu_{y|40}<12.49\\ \\text{g (mean)}",
"11.6\\pm2.306(1.090356)=11.6\\pm2.514361",
"9.086<y<14.11\\ \\text{g (one Martian)}"
]
},
{
"say": "The interval for one Martian is about 2.8 times as wide. This is because single Martians scatter about 1 g around the mean even if the line were known exactly.",
"work": [
"\\frac{s_{Y_{new}}}{s_{\\hat y}}=\\frac{1.090356}{0.3853267}=2.830"
]
}
]
}
},
{
"title": "Correlation and its test",
"when": "The question asks for the Pearson correlation between two variables.",
"steps": [
{
"do": "Calculate r from the sums of deviations.",
"why": "This is because r compares how x and y move together with how much each one varies.",
"tex": "r=\\frac{\\sum(x-\\bar x)(y-\\bar y)}{\\sqrt{\\sum(x-\\bar x)^2\\sum(y-\\bar y)^2}}"
},
{
"do": "Turn r into a t statistic.",
"why": "This is because the t table decides whether r is far from zero.",
"tex": "t=r\\sqrt{\\frac{n-2}{1-r^2}},\\quad \\nu=n-2"
},
{
"do": "Compare with the cutoff and say how strong and in which direction the relationship is.",
"why": "This is because r has both a size and a sign.",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
}
],
"example": {
"source": "Session 18 lecture example (pages 39 to 41)",
"prompt": "For the 10 Martians, Table 8-3 gives \\(\\sum(x-\\bar x)(y-\\bar y)=99.9\\), \\(\\sum(x-\\bar x)^2=224.9\\) and \\(\\sum(y-\\bar y)^2=51.8\\). Find the Pearson correlation between height and weight and test whether it differs from zero.",
"steps": [
{
"say": "The deviation products total 99.9 g cm. The units cancel in the ratio, so r has no units.",
"work": [
"r=\\frac{\\sum(x-\\bar x)(y-\\bar y)}{\\sqrt{\\sum(x-\\bar x)^2\\sum(y-\\bar y)^2}}",
"r=\\frac{99.9}{\\sqrt{224.9(51.8)}}=\\frac{99.9}{\\sqrt{11649.82}}=\\frac{99.9}{107.9343}=0.9255628"
]
},
{
"say": "The null hypothesis is that the population correlation is zero. The statistic is about 6.91 with 8 degrees of freedom.",
"work": [
"t=r\\sqrt{\\frac{n-2}{1-r^2}},\\quad \\nu=n-2",
"t=0.9255628\\sqrt{\\frac{10-2}{1-0.9255628^2}}=0.9255628\\sqrt{\\frac{8}{0.1433335}}=0.9255628\\sqrt{55.81387}=6.914757,\\quad \\nu=8"
]
},
{
"say": "The statistic passes even the 0.001 cutoff, so the correlation is not zero. It is strong and positive, so taller Martians tend to be heavier, and about 86% of the variation in weight goes with height.",
"work": [
"t_{0.05}(8)=2.306,\\quad t_{0.001}(8)=5.041",
"6.915>5.041\\ \\Rightarrow\\ P<0.001",
"r^2=0.9255628^2=0.8566665"
]
}
]
}
},
{
"title": "Compare the slopes of two groups",
"when": "Two groups each have their own regression line, like males and females.",
"steps": [
{
"do": "Fit each line and check that each slope is significant.",
"why": "This is because comparing trends only makes sense when both exist."
},
{
"do": "Write the null hypothesis that the two groups have the same slope.",
"why": "This is because the test asks whether the relationships differ.",
"tex": "H_0:\\beta_1=\\beta_2"
},
{
"do": "Find the standard error of the difference in slopes, pooling the residual variances when the group sizes differ.",
"why": "This is because the t statistic divides by it.",
"tex": "s_{b_1-b_2}=\\sqrt{s_{b_1}^2+s_{b_2}^2}\\ \\text{(equal sizes)},\\quad s^2_{y|x_p}=\\frac{(n_1-2)s^2_{y|x_1}+(n_2-2)s^2_{y|x_2}}{n_1+n_2-4},\\quad s_{b_1-b_2}=\\sqrt{\\frac{s^2_{y|x_p}}{(n_1-1)s^2_{x_1}}+\\frac{s^2_{y|x_p}}{(n_2-1)s^2_{x_2}}}"
},
{
"do": "Divide the difference in slopes by that standard error.",
"why": "This is because t measures the difference in units of its uncertainty.",
"tex": "t=\\frac{b_1-b_2}{s_{b_1-b_2}},\\quad \\nu=n_1+n_2-4"
},
{
"do": "Compare with the cutoff and conclude whether the relationships differ.",
"why": "This is because that is the question being asked.",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
}
],
"example": {
"source": "Session 18 lecture example (pages 26, 29 and 36)",
"prompt": "Separate lm() fits of weight (lb) on height (in) for 18 male and 18 female Plutonians give the slopes and standard errors below. Test whether the slopes of the male and female lines of means differ at the 0.05 level.",
"table": {
"headers": [
"Group",
"\\(n\\)",
"Slope \\(b\\) (lb/in)",
"\\(s_b\\) (lb/in)"
],
"rows": [
[
"Males (M)",
"18",
"3.2833",
"0.2041"
],
[
"Females (F)",
"18",
"2.029",
"0.4708"
]
]
},
"steps": [
{
"say": "Each line has 18 points, so each slope test has 16 degrees of freedom. Both statistics pass the 0.001 cutoff, so both trends are real and comparing them makes sense.",
"work": [
"t_M=\\frac{3.2833}{0.2041}=16.09,\\quad t_F=\\frac{2.029}{0.4708}=4.310",
"t_{0.05}(16)=2.120,\\quad t_{0.001}(16)=4.015"
]
},
{
"say": "The null hypothesis says weight rises with height at the same rate in male and female Plutonians.",
"work": [
"H_0:\\beta_M=\\beta_F,\\quad H_A:\\beta_M\\ne\\beta_F"
]
},
{
"say": "Both groups have 18 Plutonians, so the equal sizes formula is used. The two squared standard errors are added before taking the square root.",
"work": [
"s_{b_1-b_2}=\\sqrt{s_{b_1}^2+s_{b_2}^2}",
"s_{b_M-b_F}=\\sqrt{0.2041^2+0.4708^2}=\\sqrt{0.04165681+0.2216526}=\\sqrt{0.2633095}=0.5131369"
]
},
{
"say": "Males minus females is kept as the order. The slopes differ by about 2.44 standard errors.",
"work": [
"t=\\frac{b_M-b_F}{s_{b_M-b_F}}=\\frac{3.2833-2.029}{0.5131369}=\\frac{1.2543}{0.5131369}=2.444377",
"\\nu=18+18-4=32"
]
},
{
"say": "The statistic passes the 0.05 cutoff but not the 0.02 cutoff in row 32. So we reject equal slopes, and male weight rises faster with height than female weight.",
"work": [
"t_{0.05}(32)=2.037,\\quad t_{0.02}(32)=2.449",
"2.037<2.444<2.449\\ \\Rightarrow\\ 0.02<P<0.05"
]
}
]
}
}
]
},
{
"id": 19,
"tier": "m2",
"title": "Multiple regression and logistic regression",
"lead": "Multiple regression predicts one outcome from several variables at once, and logistic regression predicts the chance of a yes-or-no outcome.",
"topics": [
{
"title": "Margin of error and better evidence",
"blocks": [
{
"pages": [
3
],
"main": "**The margin of error in a survey report is the t or z cutoff times the standard error.** It is the plus-or-minus part of a confidence interval for a difference in means or proportions."
},
{
"pages": [
4,
5,
6,
7,
8
],
"main": "**Medical conclusions can change when better-designed studies are done.** Observational studies suggested hormone therapy lowered mortality, but a large randomized trial found risks. Later analyses changed the advice again, which shows why the type of study matters as much as the result.",
"sub": [
"An early cell-phone study included only phone users and linked use to lower sperm motility. A later study added a control group of people who did not use cell phones."
]
}
]
},
{
"title": "The multiple regression model",
"blocks": [
{
"pages": [
14,
15,
16,
17,
18
],
"main": "**Multiple regression fits a plane, or a higher-dimensional surface, instead of a line.** Each independent variable gets its own coefficient. Each coefficient says how much y changes when that variable goes up by one and the others stay the same.",
"sub": [
"The coefficients are again found by least squares, so they make the sum of squared errors as small as possible.",
"The residual standard error divides by n minus k minus 1, because k slopes and one intercept were estimated."
]
}
]
},
{
"title": "Testing the whole model and each variable",
"blocks": [
{
"pages": [
19,
25
],
"main": "**The F test asks whether the variables together explain the outcome.** The null hypothesis says every slope is zero. The alternative says at least one slope is not zero. F is the model mean square divided by the residual mean square, with k and n minus k minus 1 degrees of freedom.",
"end": "So a significant F means the variables, considered together, are significant predictors."
},
{
"pages": [
20,
24
],
"main": "**Each coefficient also has its own t test, which asks whether that one variable matters.** The t value is the coefficient divided by its standard error, with n minus k minus 1 degrees of freedom. R prints the estimate, the standard error, the t value and the P value for each row.",
"sub": [
"R squared is the share of the total variation in y that the model explains."
]
}
]
},
{
"title": "Too simple or too complex",
"blocks": [
{
"pages": [
26
],
"main": "**Adding more variables always fits the sample a little better, but too many makes the model follow the noise.** An **overfitted** model describes this sample well and new data badly. A good model is only as complex as the data need."
}
]
},
{
"title": "Logistic regression",
"blocks": [
{
"pages": [
27,
28,
29
],
"main": "**Logistic regression predicts the probability of a yes-or-no outcome, like having coronary heart disease.** A straight line does not work, because it can go below 0 or above 1. The **logistic function** bends into an S shape, so its output always stays between 0 and 1."
},
{
"pages": [
30,
32,
33
],
"main": "**Taking the log of the odds turns the S curve into a straight line.** This is the **logit**, the log of p divided by 1 minus p. In practice the coefficients are found by maximum likelihood, which does not need grouped probabilities."
},
{
"pages": [
34,
35,
36,
37,
38
],
"main": "**A fitted logistic model gives the probability and the odds for any value of x.** You plug x into beta 0 plus beta 1 times x, then into the logistic function to get p. The odds are p divided by 1 minus p, so the odds of coronary heart disease for a 60-year-old are 3.76 to 1.",
"sub": [
"In the O-ring example, the slope on temperature is negative, so the chance of O-ring failure goes down as the launch temperature goes up."
]
}
]
}
],
"questions": [
{
"q": "What are the null and alternative hypotheses for the F test in multiple regression?",
"a": "The null hypothesis is that all the slope coefficients are zero, so none of the variables helps predict the outcome. The alternative is that at least one coefficient is not zero. A significant F means the variables together are significant predictors."
},
{
"q": "Why can the F test be significant while one variable's t test is not?",
"a": "The F test checks all the variables together, while each t test checks one variable after the others are already in the model. A variable can add little on its own once the others are included, even when the group as a whole predicts well."
},
{
"q": "Why is a straight line a bad model for the probability of disease?",
"a": "A straight line can predict probabilities below 0 or above 1, which are impossible. The logistic function always stays between 0 and 1, so it fits a probability."
},
{
"q": "How do you turn a logistic probability into odds?",
"a": "You divide the probability by 1 minus the probability. A probability of 0.79 gives odds of 0.79 divided by 0.21, which is 3.76. That means the event is 3.76 times as likely to happen as not."
}
],
"memorize": [
{
"title": "Read a multiple regression summary from R",
"when": "The problem gives lm output with several variables, like HW3 question 3.",
"steps": [
{
"do": "Write the equation from the Estimate column.",
"why": "This is because the intercept and each coefficient are listed there.",
"tex": "\\hat y=b_0+b_1x_1+b_2x_2+b_3x_3"
},
{
"do": "State the overall null hypothesis that all slopes are zero and the alternative that at least one is not.",
"why": "This is because the F test checks the model as a whole."
},
{
"do": "Read the F statistic, its two degrees of freedom and its P value.",
"why": "This is because they decide the overall test.",
"tex": "F=\\frac{MS_{mod}}{MS_{res}},\\quad df=k,\\ n-k-1",
"table": "Use the class F table (upper tail). Numerator degrees of freedom run across the top and denominator degrees of freedom run down the side. Lightface numbers are for 0.05 and boldface numbers are for 0.01.",
"tablePath": "sources/tables/F_table.pdf"
},
{
"do": "For each variable, state its null hypothesis and read its t value and Pr(>|t|).",
"why": "This is because each coefficient has its own test."
},
{
"do": "Check each 95 percent interval from confint for zero.",
"why": "This is because an interval without zero agrees with a significant t test."
},
{
"do": "Refit with only the significant variables if any were not.",
"why": "This is because the homework question asks for the final model built from the significant variables."
},
{
"do": "Plug the given values into the final equation by hand.",
"why": "This is because the prediction is just arithmetic with the coefficients."
}
],
"example": {
"source": "Session 19 lecture example (pages 24 and 25)",
"prompt": "For 20 families, lm(SBPchild ~ SBPmother + SBPfather) prints the summary below (Residual SE 10.67 on 17 df, Multiple R-squared 0.5973, F-statistic 12.61 on 2 and 17 DF, p-value 0.0004388). Write the equation, test the model and each coefficient, and predict the child's SBP when the mother's SBP is 130 mm Hg and the father's is 150 mm Hg.",
"table": {
"headers": [
"Term",
"Estimate",
"Std. Error",
"t value",
"Pr(>|t|)"
],
"rows": [
[
"(Intercept)",
"-15.6892",
"23.6503",
"-0.663",
"0.51598"
],
[
"SBPmother",
"0.4225",
"0.1185",
"3.565",
"0.00238"
],
[
"SBPfather",
"0.4150",
"0.1248",
"3.325",
"0.00401"
]
]
},
"steps": [
{
"say": "Here \\(x_1\\) is the mother's SBP and \\(x_2\\) is the father's SBP, both in mm Hg. The intercept and both slopes come straight from the Estimate column.",
"work": [
"\\hat y=b_0+b_1x_1+b_2x_2",
"\\hat y=-15.6892+0.4225\\,x_1+0.4150\\,x_2"
]
},
{
"say": "The null hypothesis says neither parent's SBP is related to the child's mean SBP. The alternative says at least one of them is.",
"work": [
"H_0:\\beta_1=\\beta_2=0",
"H_1:\\beta_1\\ne0\\ \\text{and/or}\\ \\beta_2\\ne0"
]
},
{
"say": "R prints F of 12.61 on 2 and 17 degrees of freedom, and the same value follows from R squared. It passes both table cutoffs, so the model as a whole is significant with P of about 0.0004.",
"work": [
"F=\\frac{MS_{mod}}{MS_{res}},\\quad df=k,\\ n-k-1",
"F=12.61\\ \\text{on}\\ (2,\\ 17),\\quad P=0.0004388",
"F=\\frac{0.5973/2}{(1-0.5973)/17}=\\frac{0.29865}{0.02368824}=12.61",
"F_{0.05}(2,17)=3.59,\\quad F_{0.01}(2,17)=6.11"
]
},
{
"say": "Each null hypothesis says that parent's coefficient is zero. Both t values pass the cutoff of 2.110 in row 17, so the mother and the father coefficients are each significant.",
"work": [
"H_0:\\beta_1=0,\\quad t=\\frac{0.4225}{0.1185}=3.565,\\quad \\Pr(>|t|)=0.00238",
"H_0:\\beta_2=0,\\quad t=\\frac{0.4150}{0.1248}=3.325,\\quad \\Pr(>|t|)=0.00401",
"t_{0.05}(17)=2.110"
]
},
{
"say": "Each interval is the estimate plus or minus 2.110 standard errors, which matches confint in R to rounding. Neither interval contains zero, which agrees with the two t tests.",
"work": [
"b_j\\pm t_{0.05}(17)\\,s_{b_j}",
"0.4225\\pm2.110(0.1185)=0.4225\\pm0.2500",
"0.1725<\\beta_1<0.6725",
"0.4150\\pm2.110(0.1248)=0.4150\\pm0.2633",
"0.1517<\\beta_2<0.6783"
]
},
{
"say": "Both variables are significant, so nothing is dropped. The original equation is the final model.",
"work": [
"\\hat y=-15.6892+0.4225\\,x_1+0.4150\\,x_2"
]
},
{
"say": "The predicted mean SBP for a child with these parents is about 101.5 mm Hg.",
"work": [
"\\hat y=-15.6892+0.4225(130)+0.4150(150)",
"\\hat y=-15.6892+54.925+62.25=101.4858"
]
}
]
}
},
{
"title": "Probability and odds from a logistic model",
"when": "The problem gives the logistic coefficients and a value of x.",
"steps": [
{
"do": "Calculate beta 0 plus beta 1 times x.",
"why": "This is because it is the exponent inside the logistic function."
},
{
"do": "Put it into the logistic function to get the probability.",
"why": "This is because the logistic function turns it into a value between 0 and 1.",
"tex": "p=\\frac{1}{1+e^{-(\\beta_0+\\beta_1x)}}"
},
{
"do": "Divide p by 1 minus p to get the odds.",
"why": "This is because odds compare happening with not happening.",
"tex": "\\text{odds}=\\frac{p}{1-p}=e^{\\beta_0}e^{\\beta_1x}"
},
{
"do": "Write the answer as a sentence, like the odds are 3.76 to 1.",
"why": "This is because the result must be understood without the formula."
}
],
"example": {
"source": "Session 19 lecture example (pages 35 and 36)",
"prompt": "For 100 subjects, glm(CHD ~ AGE, family = \"binomial\") gives \\(\\beta_0=-5.30945\\) and \\(\\beta_1=0.11092\\) per year of age. Find the probability and the odds of coronary heart disease (CHD) at age 60.",
"table": {
"headers": [
"Term",
"Estimate",
"Std. Error",
"z value",
"Pr(>|z|)"
],
"rows": [
[
"(Intercept)",
"-5.30945",
"1.13365",
"-4.683",
"2.82e-06"
],
[
"AGE",
"0.11092",
"0.02406",
"4.610",
"4.02e-06"
]
]
},
"steps": [
{
"say": "Age 60 goes in for x. The result is the log of the odds of CHD at that age.",
"work": [
"\\beta_0+\\beta_1x=-5.30945+0.11092(60)=-5.30945+6.6552=1.34575"
]
},
{
"say": "The logistic function turns 1.34575 into a probability of about 0.793.",
"work": [
"p=\\frac{1}{1+e^{-(\\beta_0+\\beta_1x)}}",
"p=\\frac{1}{1+e^{-1.34575}}=\\frac{1}{1+0.2603444}=\\frac{1}{1.2603444}=0.7934339"
]
},
{
"say": "Both routes give odds of about 3.84. Rounding p to 0.79 first gives 0.79 over 0.21, which is 3.76.",
"work": [
"\\text{odds}=\\frac{p}{1-p}=e^{\\beta_0}e^{\\beta_1x}",
"\\text{odds}=\\frac{0.7934339}{1-0.7934339}=\\frac{0.7934339}{0.2065661}=3.841066",
"e^{-5.30945}e^{6.6552}=0.004944646(776.8133)=3.841066"
]
},
{
"say": "A 60-year-old has about a 79% chance of CHD, so the odds of CHD are about 3.84 to 1. With the probability rounded to 0.79, the odds are 3.76 to 1.",
"work": []
}
]
}
}
]
},
{
"id": 20,
"tier": "m2",
"title": "Paired t test and repeated measures",
"lead": "When the same people are measured more than once, you compare each person with themselves.",
"topics": [
{
"title": "Why pairing helps",
"blocks": [
{
"pages": [
4,
5,
6
],
"main": "**When each subject gets both treatments, the differences between people no longer hide the treatment effect.** An unpaired t test on such data mixes the treatment effect with the large spread between people, so it can miss a real effect. Measuring each person twice removes that spread."
}
]
},
{
"title": "The paired t test",
"blocks": [
{
"pages": [
7,
8,
9
],
"main": "**The paired t test works on one new variable, the difference for each subject.** You average the differences, find their SD, and divide by the square root of n to get the standard error. The t statistic is the mean difference divided by that standard error, with n minus 1 degrees of freedom.",
"sub": [
"The null hypothesis is that the treatment causes no change, so the true mean difference is zero.",
"It makes the same assumptions as the unpaired test, such as Normal interval data."
],
"end": "So a paired test is really a one-sample t test on the differences."
},
{
"pages": [
10,
11,
12
],
"main": "**In the smoking and platelet example and the oral contraceptive example, each person's before and after values gave one difference.** The mean difference was large compared with its standard error, so both changes were significant."
}
]
},
{
"title": "Repeated measures with more than two conditions",
"blocks": [
{
"pages": [
13,
14,
15,
16,
17,
18
],
"main": "**Repeated measures ANOVA extends the paired idea to three or more measurements on the same subjects.** The total variation is split into variation between subjects and variation within subjects. The within-subject part is split again into the treatment effect and what is left over, the residual."
},
{
"pages": [
19
],
"main": "**Repeated measures designs need fewer subjects, because each person acts as their own control.** They also have drawbacks. Subjects must come back, and one treatment must not carry over into the next. The disease must be stable and ongoing (chronic, not acute), and there can be ethical issues. Using medical twins can avoid some of these drawbacks."
}
]
}
],
"questions": [
{
"q": "Why can an unpaired t test miss an effect that a paired t test finds?",
"a": "An unpaired t test compares the groups using the spread between different people, which is large. A paired test looks at each person's own change, so that spread drops out and a real effect is easier to see."
},
{
"q": "What are the degrees of freedom for a paired t test?",
"a": "They are n minus 1, where n is the number of subjects. This is because the test works on one difference per subject."
},
{
"q": "What is one drawback of a repeated measures design?",
"a": "One treatment can carry over and affect the next measurement. The design also needs the same subjects to return and a disease that is stable and ongoing."
}
],
"memorize": [
{
"title": "Paired t test",
"when": "The same subjects are measured under two conditions, like awake and asleep in HW3 question 4.",
"steps": [
{
"do": "Name the paired t test and say why the data are paired.",
"why": "This is because each subject was measured twice."
},
{
"do": "Write the null hypothesis that there is no change between the two conditions.",
"why": "This is because the test checks whether the mean difference is zero.",
"tex": "H_0:\\delta=0"
},
{
"do": "Subtract the two measurements for every subject.",
"why": "This is because the differences are the new variable.",
"tex": "d_i=x_{1i}-x_{2i}"
},
{
"do": "Find the mean and SD of the differences.",
"why": "This is because the t statistic is built from them.",
"tex": "\\bar d=\\frac1n\\sum d_i,\\quad s_d=\\sqrt{\\frac{\\sum(d_i-\\bar d)^2}{n-1}}"
},
{
"do": "Divide the SD by the square root of n.",
"why": "This is because that is the standard error of the mean difference.",
"tex": "s_{\\bar d}=\\frac{s_d}{\\sqrt n}"
},
{
"do": "Divide the mean difference by its standard error.",
"why": "This is because t measures the change in units of its uncertainty.",
"tex": "t=\\frac{\\bar d}{s_{\\bar d}},\\quad \\nu=n-1"
},
{
"do": "Compare with the two-tailed cutoff, check a smaller level if you reject, and write the conclusion.",
"why": "This is because you report the strongest P range you can.",
"table": "Use the class t table (two-tailed). Read the row for the degrees of freedom and the column for alpha, like 0.05. If that row is not printed, use the printed rows on either side.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "If R is asked for, match the t, df, P value, interval and mean difference lines to your hand work.",
"why": "This is because the question asks you to mark each line of the output."
}
],
"example": {
"source": "Session 20 lecture example (page 10), before and after values from Session 24 page 26",
"prompt": "Eleven people have maximum percent platelet aggregation measured before and after smoking one cigarette. Assume the differences are Normal. Does smoking change platelet aggregation at the two-sided 0.05 level?",
"table": {
"headers": [
"Person",
"Before (%)",
"After (%)"
],
"rows": [
[
"1",
"25",
"27"
],
[
"2",
"25",
"29"
],
[
"3",
"27",
"37"
],
[
"4",
"44",
"56"
],
[
"5",
"30",
"46"
],
[
"6",
"67",
"82"
],
[
"7",
"53",
"57"
],
[
"8",
"53",
"80"
],
[
"9",
"52",
"61"
],
[
"10",
"60",
"59"
],
[
"11",
"28",
"43"
]
]
},
"steps": [
{
"say": "This is a paired t test because each of the 11 people was measured twice, once before and once after the cigarette.",
"work": [
"n=11"
]
},
{
"say": "The null hypothesis is that smoking one cigarette causes no change in mean platelet aggregation, so the true mean difference is zero.",
"work": [
"H_0:\\delta=0",
"H_A:\\delta\\ne0"
]
},
{
"say": "Each person gives one difference, after minus before. Only person 10 went down.",
"work": [
"d_i=x_{\\mathrm{after},i}-x_{\\mathrm{before},i}",
"d_1=27-25=2,\\quad d_2=29-25=4,\\quad d_3=37-27=10,\\quad d_4=56-44=12",
"d_5=46-30=16,\\quad d_6=82-67=15,\\quad d_7=57-53=4,\\quad d_8=80-53=27",
"d_9=61-52=9,\\quad d_{10}=59-60=-1,\\quad d_{11}=43-28=15"
]
},
{
"say": "The differences add to 113, so the mean change is about 10.27 percentage points. The squared deviations add to 636.18, which gives an SD of 7.976.",
"work": [
"\\bar d=\\frac1n\\sum d_i,\\quad s_d=\\sqrt{\\frac{\\sum(d_i-\\bar d)^2}{n-1}}",
"\\bar d=\\frac{2+4+10+12+16+15+4+27+9-1+15}{11}=\\frac{113}{11}=10.2727",
"\\sum(d_i-\\bar d)^2=636.1818",
"s_d=\\sqrt{\\frac{636.1818}{11-1}}=\\sqrt{63.6182}=7.9761"
]
},
{
"say": "The standard error is the SD shrunk by the square root of 11, because a mean of 11 differences varies less than one difference.",
"work": [
"s_{\\bar d}=\\frac{s_d}{\\sqrt n}",
"s_{\\bar d}=\\frac{7.9761}{\\sqrt{11}}=\\frac{7.9761}{3.3166}=2.4049"
]
},
{
"say": "The mean change is about 4.27 standard errors away from zero. The degrees of freedom are one less than the number of people.",
"work": [
"t=\\frac{\\bar d}{s_{\\bar d}},\\quad \\nu=n-1",
"t=\\frac{10.2727}{2.4049}=4.2716",
"\\nu=11-1=10"
]
},
{
"say": "Because 4.2716 is larger than 2.228, reject the null hypothesis. It also passes the 0.002 cutoff of 4.144 but not the 0.001 cutoff, so smoking increases platelet aggregation with P below 0.002.",
"work": [
"t_{0.05}(10)=2.228\\ \\ (\\text{row }10,\\ \\text{column }0.05)",
"|t|=4.2716>2.228",
"t_{0.002}(10)=4.144<4.2716<t_{0.001}(10)=4.587",
"0.001<P<0.002"
]
},
{
"say": "The R lines repeat the hand work. The t of 4.2716 and df of 10 match, the P value of 0.001633 sits inside the bracket, and the interval misses 0, which agrees with the test rejecting.",
"work": [
"\\texttt{t.test(after, before, paired = TRUE)}",
"t=4.2716,\\quad df=10,\\quad p\\text{-value}=0.001633",
"\\text{95\\% CI from R}\\ \\ 4.914310\\ \\ 15.631145",
"\\text{by hand}\\ \\ 10.2727-2.228(2.4049)=4.9146,\\quad 10.2727+2.228(2.4049)=15.6308",
"\\text{mean difference}\\ \\ 10.2727"
]
}
]
}
}
]
},
{
"id": 21,
"tier": "m2",
"title": "Repeated measures ANOVA and McNemar's test",
"lead": "Repeated measures ANOVA compares three or more measurements on the same subjects, and McNemar's test does the same job for yes-or-no outcomes measured twice.",
"topics": [
{
"title": "Splitting the variation",
"blocks": [
{
"pages": [
2,
3,
4,
5,
6
],
"main": "**Repeated measures ANOVA removes the differences between subjects, then compares the treatment effect with what is left.** You find each subject's mean, each treatment's mean and the grand mean. The within-subject sum of squares measures how each person varies around their own mean.",
"sub": [
"The treatment sum of squares is n times the squared distances of the treatment means from the grand mean, because each treatment mean uses n subjects.",
"The residual sum of squares is the within-subject sum of squares minus the treatment sum of squares."
],
"end": "So F is the treatment mean square over the residual mean square, with m minus 1 and (n minus 1)(m minus 1) degrees of freedom."
}
]
},
{
"title": "Two worked examples",
"blocks": [
{
"pages": [
7,
8
],
"main": "**In the blood pressure example, the treatment means at 4, 8 and 12 weeks were almost the same.** The treatment mean square was tiny compared with the residual mean square, so F was far below the cutoff and there was no difference over time."
},
{
"pages": [
9,
10,
11
],
"main": "**In the lung function example, almost all the within-subject variation came from the exposure conditions.** The residual mean square was very small, so F was very large and the conditions differed."
}
]
},
{
"title": "Finding which conditions differ",
"blocks": [
{
"pages": [
12
],
"main": "**After a significant repeated measures ANOVA, Holm-corrected t tests find which conditions differ.** Each t compares two treatment means using the residual mean square. The degrees of freedom for the t table are the residual degrees of freedom, (n minus 1)(m minus 1).",
"end": "So the Holm steps are the same as before, with the residual mean square in place of the within-groups variance."
}
]
},
{
"title": "McNemar's test",
"blocks": [
{
"pages": [
14,
15
],
"main": "**McNemar's test compares yes-or-no outcomes measured twice on the same people.** An ordinary chi-square test is wrong here, because the rows and columns are not independent. McNemar's test looks only at the people who changed, because people who stayed the same tell you nothing about the treatment.",
"sub": [
"If the treatment has no effect, half of the people who changed should change each way."
]
},
{
"pages": [
16,
17
],
"main": "**The expected count for each changing cell is the number who changed divided by 2.** You use the Yates correction because it is a two-by-two table, and there is 1 degree of freedom. McNemar's test can also compare two diagnostic methods on the same subjects."
}
]
}
],
"questions": [
{
"q": "Why is an ordinary chi-square test wrong for before-and-after yes-or-no data?",
"a": "It is wrong because the same people appear before and after, so the rows and columns are not independent. McNemar's test fixes this by using only the people whose result changed."
},
{
"q": "What degrees of freedom do the Holm t tests use after repeated measures ANOVA?",
"a": "They use the residual degrees of freedom, which are (n minus 1) times (m minus 1). The t statistics also use the residual mean square."
},
{
"q": "Why does repeated measures ANOVA remove the between-subject variation?",
"a": "It removes it because people differ a lot from each other regardless of treatment. Taking that out leaves a smaller residual, so a real treatment effect is easier to detect."
}
],
"memorize": [
{
"title": "Repeated measures ANOVA by hand",
"when": "The problem gives a table of n subjects each measured under m conditions.",
"steps": [
{
"do": "Name the test and write the null hypothesis that the outcome does not differ across the conditions.",
"why": "This is because the same subjects are measured under every condition."
},
{
"do": "Find each subject's mean, each treatment's mean and the grand mean.",
"why": "This is because every sum of squares is built from these means.",
"tex": "\\bar S_s=\\frac1m\\sum_t x_{ts},\\quad \\bar T_t=\\frac1n\\sum_s x_{ts}"
},
{
"do": "Add up each subject's squared distances from their own mean.",
"why": "This is because that is the within-subject variation.",
"tex": "SS_{wit\\,subjs}=\\sum_s\\sum_t (x_{ts}-\\bar S_s)^2"
},
{
"do": "Calculate the treatment sum of squares.",
"why": "This is because it measures how far the treatment means are from each other.",
"tex": "SS_{treat}=n\\sum_t(\\bar T_t-\\bar X)^2"
},
{
"do": "Subtract to get the residual sum of squares.",
"why": "This is because what is left after the treatment effect is the residual.",
"tex": "SS_{res}=SS_{wit\\,subjs}-SS_{treat}"
},
{
"do": "Divide each by its degrees of freedom and form F.",
"why": "This is because F compares the two mean squares.",
"tex": "F=\\frac{SS_{treat}/(m-1)}{SS_{res}/\\big((n-1)(m-1)\\big)}"
},
{
"do": "Compare with the F cutoff and write the conclusion with a P range.",
"why": "This is because the conclusion answers the study question.",
"table": "Use the class F table (upper tail). Numerator degrees of freedom run across the top and denominator degrees of freedom run down the side. Lightface numbers are for 0.05 and boldface numbers are for 0.01.",
"tablePath": "sources/tables/F_table.pdf"
}
],
"example": {
"source": "Session 21 lecture example (pages 9 to 11)",
"prompt": "FEV1 (L) is measured in the same 4 people at baseline, 1 hour after inhaling endotoxin, and 2 hours after endotoxin plus salbutamol. Does mean FEV1 differ across the 3 conditions at the 0.05 level?",
"table": {
"headers": [
"Subject",
"Baseline",
"Endotoxin",
"Endotoxin + salbutamol"
],
"rows": [
[
"1",
"3.7",
"3.4",
"4.0"
],
[
"2",
"4.0",
"3.7",
"4.4"
],
[
"3",
"3.0",
"2.8",
"3.2"
],
[
"4",
"3.2",
"2.9",
"3.4"
]
]
},
"steps": [
{
"say": "This is a repeated measures ANOVA because the same 4 people are measured under all 3 conditions. The null hypothesis is that mean FEV1 does not differ across the conditions.",
"work": [
"H_0:\\mu_{base}=\\mu_{endo}=\\mu_{endo+salb}",
"m=3,\\quad n=4"
]
},
{
"say": "Each row gives a subject mean and each column gives a treatment mean. The grand mean is the mean of all 12 values.",
"work": [
"\\bar S_1=\\frac{3.7+3.4+4.0}{3}=3.7000,\\quad \\bar S_2=\\frac{4.0+3.7+4.4}{3}=4.0333",
"\\bar S_3=\\frac{3.0+2.8+3.2}{3}=3.0000,\\quad \\bar S_4=\\frac{3.2+2.9+3.4}{3}=3.1667",
"\\bar T_1=\\frac{3.7+4.0+3.0+3.2}{4}=3.475,\\quad \\bar T_2=\\frac{3.4+3.7+2.8+2.9}{4}=3.200",
"\\bar T_3=\\frac{4.0+4.4+3.2+3.4}{4}=3.750",
"\\bar X=\\frac{41.7}{12}=3.475"
]
},
{
"say": "Each person is compared only with their own mean, so differences in lung size between people drop out. The four pieces add to 0.6333.",
"work": [
"SS_1=(3.7-3.7)^2+(3.4-3.7)^2+(4.0-3.7)^2=0.1800",
"SS_2=(4.0-4.0333)^2+(3.7-4.0333)^2+(4.4-4.0333)^2=0.2467",
"SS_3=(3.0-3.0)^2+(2.8-3.0)^2+(3.2-3.0)^2=0.0800",
"SS_4=(3.2-3.1667)^2+(2.9-3.1667)^2+(3.4-3.1667)^2=0.1267",
"SS_{wit\\,subjs}=0.1800+0.2467+0.0800+0.1267=0.6333"
]
},
{
"say": "The treatment means sit 0, 0.275 and 0.275 L from the grand mean. Each mean uses 4 people, so the squared distances are multiplied by 4.",
"work": [
"SS_{treat}=n\\sum_t(\\bar T_t-\\bar X)^2",
"SS_{treat}=4\\left[(3.475-3.475)^2+(3.200-3.475)^2+(3.750-3.475)^2\\right]=0.6050"
]
},
{
"say": "Most of the within-subject variation is explained by the treatments, so only a small residual is left.",
"work": [
"SS_{res}=SS_{wit\\,subjs}-SS_{treat}",
"SS_{res}=0.63333-0.60500=0.02833"
]
},
{
"say": "The treatment mean square is about 64 times the residual mean square.",
"work": [
"DF_{treat}=3-1=2,\\quad DF_{res}=(4-1)(3-1)=6",
"MS_{treat}=\\frac{0.6050}{2}=0.3025,\\quad MS_{res}=\\frac{0.02833}{6}=0.004722",
"F=\\frac{0.3025}{0.004722}=64.06"
]
},
{
"say": "F is far above both cutoffs, so reject the null hypothesis. Mean FEV1 differs across baseline, endotoxin, and endotoxin plus salbutamol, with P below 0.01.",
"work": [
"F_{0.05}(2,6)=5.14,\\quad F_{0.01}(2,6)=10.92\\ \\ (\\text{column }2,\\ \\text{row }6)",
"F=64.06>10.92",
"P<0.01"
]
}
]
}
},
{
"title": "Holm pairwise t tests after repeated measures ANOVA",
"when": "The repeated measures ANOVA was significant and you are asked which conditions differ.",
"steps": [
{
"do": "Calculate t for each pair of treatment means with the residual mean square.",
"why": "This is because the residual mean square is the shared error.",
"tex": "t=\\frac{\\bar T_i-\\bar T_j}{\\sqrt{2MS_{res}/n}}"
},
{
"do": "Use the residual degrees of freedom for the table.",
"why": "This is because the error estimate came from the residual.",
"tex": "\\nu=(n-1)(m-1)",
"table": "Use the class t table (two-tailed) with the within-groups or residual degrees of freedom. A level like 0.0167 is not printed, so bracket it between the 0.01 and 0.02 columns, or use a cutoff the question gives.",
"tablePath": "sources/tables/t_table.pdf"
},
{
"do": "Order the pairs by size of t and apply the Holm levels, stopping at the first failure.",
"why": "This is because the Holm rule is the same as before.",
"tex": "\\alpha_j=\\frac{\\alpha_T}{k-j+1}"
},
{
"do": "Write one combined conclusion with P less than 0.05.",
"why": "This is because the statement covers every pair."
}
],
"example": {
"source": "Session 21 lecture example (pages 11 and 12)",
"prompt": "The FEV1 repeated measures ANOVA rejected. Using rounded values, treatment means 3.48 L (baseline), 3.20 L (endotoxin) and 3.75 L (endotoxin + salbutamol), \\(MS_{res}=0.0047\\) and \\(n=4\\), find which conditions differ with an overall 0.05 level.",
"table": {
"headers": [
"Condition",
"Treatment mean (L)"
],
"rows": [
[
"Baseline",
"3.48"
],
[
"Endotoxin",
"3.20"
],
[
"Endotoxin + salbutamol",
"3.75"
]
]
},
"steps": [
{
"say": "All three pairs share one standard error because every treatment mean uses the same 4 people. Endotoxin against salbutamol gives the biggest t.",
"work": [
"t=\\frac{\\bar T_i-\\bar T_j}{\\sqrt{2MS_{res}/n}}",
"\\sqrt{\\frac{2(0.0047)}{4}}=0.048477",
"t_{\\text{base, endo}}=\\frac{3.48-3.20}{0.048477}=5.776",
"t_{\\text{endo, salb}}=\\frac{3.20-3.75}{0.048477}=-11.346",
"t_{\\text{base, salb}}=\\frac{3.48-3.75}{0.048477}=-5.570"
]
},
{
"say": "The table row is 6 because the shared error came from the residual mean square.",
"work": [
"\\nu=(n-1)(m-1)=(4-1)(3-1)=6"
]
},
{
"say": "The largest t is tested at the strictest level. The levels 0.0167 and 0.025 are not printed, so use the stricter printed columns 0.01 and 0.02. Every pair passes, so no stop is needed.",
"work": [
"\\alpha_1=\\frac{0.05}{3}=0.0167,\\quad \\alpha_2=\\frac{0.05}{2}=0.025,\\quad \\alpha_3=\\frac{0.05}{1}=0.05",
"|t|=11.346>t_{0.01}(6)=3.707>t_{0.0167}(6)\\ \\Rightarrow\\ \\text{endo and salb differ}",
"|t|=5.776>t_{0.02}(6)=3.143>t_{0.025}(6)\\ \\Rightarrow\\ \\text{base and endo differ}",
"|t|=5.570>t_{0.05}(6)=2.447\\ \\Rightarrow\\ \\text{base and salb differ}"
]
},
{
"say": "All three conditions differ from each other with P below 0.05. FEV1 falls after endotoxin, and after salbutamol it rises above both the endotoxin level and baseline.",
"work": [
"P<0.05"
]
}
]
}
},
{
"title": "McNemar's test",
"when": "A yes-or-no outcome is measured twice on the same people, or two tests are run on the same people.",
"steps": [
{
"do": "Set up the before-by-after table and find the two cells where people changed.",
"why": "This is because only those people carry information about the treatment."
},
{
"do": "Write the null hypothesis that changing one way is as likely as changing the other way.",
"why": "This is because no effect means equal change in both directions."
},
{
"do": "Divide the number who changed by 2 to get the expected count.",
"why": "This is because half should change each way under no effect.",
"tex": "E=\\frac{b+c}{2}"
},
{
"do": "Calculate chi-square with the Yates correction on the two changing cells.",
"why": "This is because it is a two-by-two table.",
"tex": "\\chi^2=\\frac{(|b-E|-\\frac12)^2}{E}+\\frac{(|c-E|-\\frac12)^2}{E},\\quad \\nu=1"
},
{
"do": "Compare with the chi-square cutoff for 1 degree of freedom and write the conclusion.",
"why": "This is because the decision follows the usual rule.",
"table": "Use the class chi-square table (upper tail). Read the row for the degrees of freedom and the column for alpha. For 1 degree of freedom at 0.05 the printed value is 3.841.",
"tablePath": "sources/tables/Chi_Squared_Table2.pdf"
}
],
"example": {
"source": "Session 21 lecture example (page 17)",
"prompt": "Twenty people, none of whom has hypertension by the gold standard, are judged by an automated BP machine and by an experienced person. Do the two methods differ in specificity at the 0.05 level?",
"table": {
"headers": [
"BP machine by person",
"Person positive",
"Person negative"
],
"rows": [
[
"Machine positive",
"3",
"7"
],
[
"Machine negative",
"1",
"9"
]
]
},
"steps": [
{
"say": "The same 20 people were judged both ways. Only the 7 called positive by the machine alone and the 1 called positive by the person alone disagree.",
"work": [
"a=3,\\quad b=7,\\quad c=1,\\quad d=9"
]
},
{
"say": "The null hypothesis is that machine positive with person negative is as likely as the reverse, so the two methods have the same specificity.",
"work": [
"H_0:P(\\text{machine}+,\\ \\text{person}-)=P(\\text{machine}-,\\ \\text{person}+)"
]
},
{
"say": "Eight people changed, so 4 are expected in each direction if the methods agree.",
"work": [
"E=\\frac{b+c}{2}=\\frac{7+1}{2}=4"
]
},
{
"say": "Each changing cell is 3 away from 4. The Yates correction takes off one half before squaring.",
"work": [
"\\chi^2=\\frac{(|b-E|-\\frac12)^2}{E}+\\frac{(|c-E|-\\frac12)^2}{E}",
"\\chi^2=\\frac{(|7-4|-\\frac12)^2}{4}+\\frac{(|1-4|-\\frac12)^2}{4}=\\frac{6.25}{4}+\\frac{6.25}{4}=3.125",
"\\nu=1"
]
},
{
"say": "Because 3.125 is below 3.841, do not reject the null hypothesis. The machine and the person do not differ significantly in specificity, even though the machine made 7 false calls and the person 1.",
"work": [
"\\chi^2_{0.05}(1)=3.841\\ \\ (\\text{row }1,\\ \\text{column }\\chi^2_{.050})",
"\\chi^2=3.125<3.841",
"\\chi^2_{0.10}(1)=2.706<3.125\\ \\Rightarrow\\ 0.05<P<0.10"
]
}
]
}
}
]
},
{
"id": 22,
"tier": "m2b",
"title": "Machine learning · clustering and classification",
"lead": "Clustering finds groups in data that have no labels, and classification puts a new object into groups that are already labeled.",
"topics": [
{
"title": "What machine learning does",
"blocks": [
{
"pages": [
3,
4,
5
],
"main": "**Machine learning finds patterns in data automatically and uses them to make predictions.** In **supervised learning**, the computer learns from past data with known answers. In **unsupervised learning**, it learns from data without answers."
}
]
},
{
"title": "Clustering versus classification",
"blocks": [
{
"pages": [
6,
7,
8,
9
],
"main": "**Clustering groups data so that members of a group are similar and different groups are not.** Nobody tells the algorithm what the groups are, so it is unsupervised. The groups can then reveal relationships nobody noticed before."
},
{
"pages": [
10,
11,
12,
13
],
"main": "**Classification assigns a new object to one of several groups that are already defined.** It learns from labeled examples, so it is supervised. A new object goes to the group of the examples it is most similar to."
}
]
},
{
"title": "Measuring distance",
"blocks": [
{
"pages": [
15,
16
],
"main": "**Similarity is measured as distance between points, so a small distance means similar and a large distance means different.** The **Euclidean distance** is the square root of the sum of squared differences in each feature. The Manhattan distance adds the absolute differences instead. The Minkowski distance is the general form that includes both."
}
]
},
{
"title": "k-means clustering",
"blocks": [
{
"pages": [
17,
18,
19,
20,
21
],
"main": "**k-means splits the data into k clusters by repeating two steps until nothing changes.** First, each point is assigned to its nearest centroid. Second, each centroid is moved to the mean of the points assigned to it. The number of clusters k is chosen before starting, and the starting centroids are k points picked at random from the data.",
"end": "So each iteration is an assign step followed by an update step."
},
{
"pages": [
22,
23,
24,
25,
26
],
"main": "**In the medicine example with two features, one medicine switched clusters in the second iteration.** After the first iteration, medicine 1 was alone in one cluster and medicines 2, 3 and 4 were in the other. In the second iteration, medicine 2 was closer to the first centroid, so it moved. That left medicines 1 and 2 in one cluster and medicines 3 and 4 in the other."
}
]
},
{
"title": "Choosing k and the limits of k-means",
"blocks": [
{
"pages": [
32
],
"main": "**More clusters always lower the within-cluster sum of squares, so you look for the point where adding clusters stops helping much.** Too few clusters mix different groups, and too many split real groups apart."
},
{
"pages": [
33
],
"main": "**k-means has limits that come from how it works.** You must choose k ahead of time. The result can depend on the starting centroids. Every feature counts equally, and extreme points can distort the distances. It works poorly when the groups are not compact blob shapes (hyperellipsoids), such as rings. It is also not practical for very large data sets."
}
]
},
{
"title": "K-nearest neighbors classification",
"blocks": [
{
"pages": [
34,
35,
36,
37,
38
],
"main": "**K-nearest neighbors (K-NN) classifies a new object by looking at the K labeled examples closest to it.** The new object joins the class that is most common among those K neighbors. The share of neighbors in each class gives a probability for that class.",
"sub": [
"K here means the number of neighbors, which is different from the k in k-means.",
"If K is 1, the object copies its single nearest neighbor. If K is the whole training set, it always joins the biggest class."
]
},
{
"pages": [
39
],
"main": "**Features are scaled before K-NN so that one large-scale feature does not dominate the distance.** Min-max scaling squeezes each feature into the range 0 to 1. Z-score scaling subtracts the mean and divides by the SD."
},
{
"pages": [
40,
41,
42
],
"main": "**In the surgical mesh example, the new mesh's three nearest vendors were mostly Fail, so it was classified as Fail.** Two of its three neighbors failed, so the probability of failing was two thirds."
}
]
}
],
"questions": [
{
"q": "What is the difference between clustering and classification?",
"a": "Clustering finds groups in data without any labels, so it is unsupervised. Classification puts a new object into groups that are already labeled, so it is supervised."
},
{
"q": "What are the two steps that k-means repeats?",
"a": "First, it assigns each point to its nearest centroid. Second, it moves each centroid to the mean of its assigned points. It repeats until the assignments stop changing."
},
{
"q": "Why are features scaled before K-NN?",
"a": "Features are scaled because a feature with large numbers would dominate the distance. Scaling puts every feature on a similar range, so each one counts fairly."
},
{
"q": "What does the K in K-NN mean, and is it the same as the k in k-means?",
"a": "In K-NN, K is the number of nearest neighbors used to vote. It is not the same as the k in k-means, which is the number of clusters."
}
],
"memorize": [
{
"title": "One iteration of k-means by hand",
"when": "The problem gives a small table of points, k and starting centroids, like the Session 22 exercise.",
"steps": [
{
"do": "Write the starting centroids.",
"why": "This is because every distance is measured from them."
},
{
"do": "Calculate the Euclidean distance from every point to every centroid.",
"why": "This is because points join the closest centroid.",
"tex": "d(q,r)=\\sqrt{\\sum_i (q_i-r_i)^2}"
},
{
"do": "Assign each point to the centroid with the smaller distance.",
"why": "This is because that is the assign step."
},
{
"do": "Move each centroid to the mean of its assigned points, feature by feature.",
"why": "This is because that is the update step.",
"tex": "c_j=\\frac{1}{n_j}\\sum_{i:\\,y_i=j} x_i"
},
{
"do": "Report each point's cluster label and the new centroids.",
"why": "This is because the question asks for both."
}
],
"example": {
"source": "Session 22 lecture example (pages 17 to 19)",
"prompt": "Ten ages are 20, 21, 22, 28, 35, 40, 41, 42, 43 and 44. Run one iteration of k-means with \\(k=2\\) and starting centroids \\(c_1=21\\) and \\(c_2=30\\). Give each age its cluster label and find the new centroids.",
"steps": [
{
"say": "Start from the two given centroids, 21 and 30 years.",
"work": [
"c_1=21,\\quad c_2=30"
]
},
{
"say": "With one feature the Euclidean distance is just the size of the difference, so each age gets two distances.",
"work": [
"d(q,r)=\\sqrt{\\sum_i (q_i-r_i)^2}=|q-r|\\ \\text{for one feature}",
"d(20,21)=|20-21|=1,\\quad d(20,30)=|20-30|=10,\\qquad d(21,21)=|21-21|=0,\\quad d(21,30)=|21-30|=9",
"d(22,21)=|22-21|=1,\\quad d(22,30)=|22-30|=8,\\qquad d(28,21)=|28-21|=7,\\quad d(28,30)=|28-30|=2",
"d(35,21)=|35-21|=14,\\quad d(35,30)=|35-30|=5,\\qquad d(40,21)=|40-21|=19,\\quad d(40,30)=|40-30|=10",
"d(41,21)=|41-21|=20,\\quad d(41,30)=|41-30|=11,\\qquad d(42,21)=|42-21|=21,\\quad d(42,30)=|42-30|=12",
"d(43,21)=|43-21|=22,\\quad d(43,30)=|43-30|=13,\\qquad d(44,21)=|44-21|=23,\\quad d(44,30)=|44-30|=14"
]
},
{
"say": "Ages 20, 21 and 22 are closer to 21, so they join cluster 1. Age 28 is 2 away from 30 but 7 away from 21, so it joins cluster 2 with every older age.",
"work": [
"y=(1,1,1,2,2,2,2,2,2,2)"
]
},
{
"say": "Each centroid moves to the mean of its members. Cluster 1 keeps its centroid at 21, while cluster 2 moves from 30 up to 39.",
"work": [
"c_j=\\frac{1}{n_j}\\sum_{i:\\,y_i=j} x_i",
"c_1=\\frac{20+21+22}{3}=\\frac{63}{3}=21",
"c_2=\\frac{28+35+40+41+42+43+44}{7}=\\frac{273}{7}=39"
]
},
{
"say": "After one iteration the clusters are 20 to 22 and 28 to 44, with centroids 21 and 39. A second iteration would move 28 into cluster 1, because 28 is now closer to 21.",
"work": [
"y=(1,1,1,2,2,2,2,2,2,2),\\quad c_1=21,\\quad c_2=39",
"d(28,21)=7<d(28,39)=11"
]
}
]
}
},
{
"title": "Classify a new object with K-NN",
"when": "The problem gives labeled examples, a new object and a value of K.",
"steps": [
{
"do": "Scale the features if they are on very different scales.",
"why": "This is because a large-scale feature would dominate the distance."
},
{
"do": "Calculate the distance from the new object to every labeled example.",
"why": "This is because K-NN uses the closest examples."
},
{
"do": "Rank the distances and pick the K smallest.",
"why": "This is because those are the K nearest neighbors."
},
{
"do": "Count the classes among those neighbors and assign the most common one.",
"why": "This is because K-NN assigns the plurality class."
},
{
"do": "Give the probability as the share of neighbors in that class.",
"why": "This is because the question often asks how sure the classification is."
}
],
"example": {
"source": "Session 22 lecture example (pages 40 to 42)",
"prompt": "Surgical mesh from four vendors was graded Pass or Fail by surgeons. A new vendor has strength \\(x_1=7\\) kg/m² and flexibility \\(x_2=3\\). Classify it with K-NN using \\(K=3\\) and the Euclidean distance, and give the probability that it fails.",
"table": {
"headers": [
"Vendor",
"x1 strength (kg/m²)",
"x2 flexibility",
"Surgeons"
],
"rows": [
[
"A",
"7",
"7",
"Pass"
],
[
"B",
"4",
"7",
"Pass"
],
[
"C",
"4",
"3",
"Fail"
],
[
"D",
"4",
"1",
"Fail"
]
]
},
"steps": [
{
"say": "Strength runs from 4 to 7 and flexibility from 1 to 7, so both features are on similar small scales and are used as they are.",
"work": [
"q=(7,3)"
]
},
{
"say": "Subtract the matching features, square, add and take the square root for each vendor.",
"work": [
"d=\\sqrt{(x_1-q_1)^2+(x_2-q_2)^2}",
"d_A=\\sqrt{(7-7)^2+(7-3)^2}=\\sqrt{16}=4",
"d_B=\\sqrt{(4-7)^2+(7-3)^2}=\\sqrt{25}=5",
"d_C=\\sqrt{(4-7)^2+(3-3)^2}=\\sqrt{9}=3",
"d_D=\\sqrt{(4-7)^2+(1-3)^2}=\\sqrt{13}=3.6056"
]
},
{
"say": "C is nearest, then D and then A. B is the farthest, so it is left out when K is 3.",
"work": [
"d_C=3<d_D=3.6056<d_A=4<d_B=5"
]
},
{
"say": "Two of the three neighbors failed, so the new mesh is classified as Fail.",
"work": [
"C=\\text{Fail},\\quad D=\\text{Fail},\\quad A=\\text{Pass}"
]
},
{
"say": "Two of the three votes are Fail, so the probability that the new mesh fails is 2 in 3.",
"work": [
"P(\\text{Fail})=\\frac{2}{3}=0.6667"
]
}
]
}
}
]
},
{
"id": 23,
"tier": "m2b",
"title": "K-NN in practice, model performance and neural networks",
"lead": "K-NN can diagnose breast cancer samples from measurements of their cell nuclei, and a confusion matrix shows how good those diagnoses are. A neural network is a more flexible way to predict an outcome.",
"topics": [
{
"title": "Clustering and classification again",
"blocks": [
{
"pages": [
3,
4,
5,
6,
7
],
"main": "**Clustering groups unlabeled data by similarity, and classification puts a new object into groups that are already labeled.** In the SAT score plot, k-means finds three groups that nobody named ahead of time. In the food plot, K-NN decides whether a tomato is a fruit, a vegetable or a protein from its nearest labeled foods."
}
]
},
{
"title": "The knn() function in R",
"blocks": [
{
"pages": [
8
],
"main": "**The knn() function classifies every test case in one call.** You give it the training cases, the test cases, the true classes of the training cases (cl) and the number of neighbors k. With prob set to TRUE, it also returns the share of votes for the winning class."
}
]
},
{
"title": "The Wisconsin breast cancer data",
"blocks": [
{
"pages": [
9,
10
],
"main": "**A pathologist measures the cell nuclei in a fine needle aspirate biopsy, because cancer nuclei are often larger, darker and more variable in size.** Ten quantities are measured, such as radius, texture, perimeter, area, smoothness and concavity. A cancer nucleus is larger and darker because it often contains too much DNA."
},
{
"pages": [
11,
12,
13
],
"main": "**The data set has 569 samples, each with an id, a diagnosis and 30 measurements.** The 30 measurements are the mean, the standard error and the largest value of each of the ten quantities. There are 357 benign samples (62.7 percent) and 212 malignant samples (37.3 percent).",
"sub": [
"The diagnosis is turned into a factor with the labels Benign and Malignant, because R classifiers expect the class to be a factor."
]
},
{
"pages": [
14,
15
],
"main": "**Box plots, histograms and scatter plots show that malignant samples tend to have a larger radius, area and concavity.** The two classes overlap, so no single feature separates them perfectly. That is why K-NN combines all the features in one distance."
}
]
},
{
"title": "Scaling, training and testing",
"blocks": [
{
"pages": [
16
],
"main": "**Each feature is min-max scaled to the range 0 to 1, because area runs into the thousands while smoothness is about 0.1.** Without scaling, area would control the distance almost alone. The id column is dropped first, so only the 30 measurements are scaled.",
"sub": [
"The first 469 samples are the training set and the last 100 are the test set. The model never sees the test labels, so the test shows how it does on new patients.",
"K is set to 21, so each test sample is classified by a vote of its 21 nearest training samples."
]
}
]
},
{
"title": "Results and their probabilities",
"blocks": [
{
"pages": [
17
],
"main": "**With min-max scaling and K equal to 21, 98 of the 100 test samples were classified correctly.** All 61 benign samples were called benign. Of the 39 malignant samples, 37 were called malignant and 2 were wrongly called benign."
},
{
"pages": [
18
],
"main": "**The probability for each sample is the share of its 21 neighbors that voted for the winning class.** A probability of 1 means all 21 agreed. One malignant sample was called benign with probability 0.762, which is 16 of 21 votes, so a high probability can still be wrong.",
"sub": [
"A correct call can also have a low probability, like 0.667, which is 14 of 21 votes. So the probability is only an estimate of how sure the call is."
]
}
]
},
{
"title": "Trying to improve the model",
"blocks": [
{
"pages": [
19,
20
],
"main": "**Z-score scaling did worse here, with 95 of 100 correct, because 5 malignant samples were called benign.** Changing K with min-max scaling did not beat K equal to 21 either. K equal to 1 got 96 correct, with 3 false malignant calls and 1 missed cancer. K equal to 27 got 96 correct, with 4 missed cancers.",
"sub": [
"Missing a cancer is worse than a false alarm, so the number of malignant samples called benign matters more than the total."
]
}
]
},
{
"title": "The confusion matrix",
"blocks": [
{
"pages": [
21,
22
],
"main": "**A confusion matrix counts how often the predicted class agrees with the actual class.** The correct calls sit on the diagonal. With two classes, the four cells are true negatives, false positives, false negatives and true positives.",
"sub": [
"**Accuracy** is the share of all cases that were classified correctly. The **error rate** is the share that were wrong, so the two add to 1."
]
},
{
"pages": [
22
],
"main": "**Accuracy can look excellent when the condition is rare.** If a genetic variant appears in only 10 of 100,000 newborns, a test that always says no variant is right 99.99 percent of the time. It still misses every one of the 10 babies who carry it."
},
{
"pages": [
23
],
"main": "**Sensitivity and specificity check each class separately.** **Sensitivity**, the true positive rate, is the share of actual positives the model catches. **Specificity**, the true negative rate, is the share of actual negatives it correctly clears. With z-score scaling, sensitivity was 34 of 39, or 0.872, and specificity was 61 of 61, or 1.00.",
"sub": [
"Making a model catch more positives usually makes it raise more false alarms. A **receiver operating characteristic (ROC) curve** shows this trade-off between sensitivity and specificity."
]
}
]
},
{
"title": "What a neural network is",
"blocks": [
{
"pages": [
24
],
"main": "**A neural network takes a vector of inputs and builds a nonlinear function of them to predict a response.** It can predict a number or a class. Its structure is modeled on neurons in the brain, and it needs large data sets to build.",
"sub": [
"It is used in speech, handwriting and image recognition, in self-driving cars and in models of weather or material strength."
]
},
{
"pages": [
25
],
"main": "**An artificial neuron multiplies each input by a weight, adds the results and passes the sum through an activation function.** This copies a real neuron, where dendrites carry signals from other neurons into the cell body and the combined input decides the output. The weight sets how strongly each input counts."
}
]
},
{
"title": "Activation function, topology and training",
"blocks": [
{
"pages": [
26
],
"main": "**A network is defined by its activation function, its topology and its training algorithm.** The **threshold** activation function outputs 1 when the summed input is 0 or more and 0 otherwise. The **sigmoid** function, 1 over 1 plus e to the minus x, gives a smooth output between 0 and 1."
},
{
"pages": [
27,
28,
29
],
"main": "**The topology is the number of nodes in each layer, the number of layers and outputs, and the direction information flows.** Layers between the inputs and the output are hidden layers. A network with several hidden layers is called **deep learning**.",
"sub": [
"Convolutional networks used for image recognition are not fully connected.",
"In a **recurrent** network, information can also travel backward, so it can learn patterns in time series data."
]
},
{
"pages": [
30
],
"main": "**Backpropagation trains the network by finding the weights that make the sum of squared errors as small as possible.** It needs training data where the correct outputs are known. Each error is the gap between the known output and the network's prediction.",
"sub": [
"It is the same least-squares idea as regression, but the function being fitted is nonlinear."
]
}
]
},
{
"title": "The concrete strength example",
"blocks": [
{
"pages": [
31,
32,
33,
34
],
"main": "**A neural network predicted the compressive strength of 1030 concrete samples from eight ingredients and their age.** The inputs were min-max scaled first. With one hidden neuron, the predicted and actual strengths of the test samples had a correlation of 0.806.",
"sub": [
"With five hidden neurons, the correlation rose to 0.924 and the training error fell from 5.08 to 1.63. The bigger network needed many more training steps, 86849 instead of 4882."
]
}
]
},
{
"title": "Classifying a new tumor sample by hand",
"blocks": [
{
"pages": [
35
],
"main": "**For the new sample at size 4 and irregularity 4, K equal to 3 gives benign and K equal to 5 gives malignant.** The three nearest samples are A and C at distance 1 and B at 1.41. Two of them are benign, so the probability of benign is 2 out of 3, or 0.67.",
"sub": [
"Adding D at distance 2 and E at 2.24 makes five neighbors with three malignant. So with K equal to 5 the sample is malignant with probability 0.6."
],
"end": "So the choice of K can change the answer when a sample sits between the classes."
}
]
}
],
"questions": [
{
"q": "What do the train, test, cl and k arguments of knn() mean?",
"a": "The train argument holds the training cases and test holds the cases to classify. The cl argument is the factor of true classes for the training cases, and k is the number of neighbors that vote."
},
{
"q": "Why was the test set kept separate from the training set?",
"a": "It was kept separate so the model is judged on samples it has never seen. That shows how well it would diagnose new patients."
},
{
"q": "What does the probability returned by knn() tell you?",
"a": "It is the share of the K neighbors that voted for the winning class. With K equal to 21, a probability of 0.762 means 16 neighbors agreed. It is only an estimate, so a confident call can still be wrong."
},
{
"q": "Why can accuracy be misleading?",
"a": "Accuracy can be high even when the model misses every case of a rare condition. If only 10 of 100,000 babies carry a variant, always saying no is 99.99 percent accurate but finds none of them."
},
{
"q": "What are sensitivity and specificity?",
"a": "Sensitivity is the share of actual positives that the model calls positive, TP over TP plus FN. Specificity is the share of actual negatives that it calls negative, TN over TN plus FP."
},
{
"q": "What three things define a neural network?",
"a": "Its activation function, its topology and its training algorithm define it. The topology is the number of nodes per layer, the number of layers and outputs, and the direction information flows."
},
{
"q": "What does backpropagation make as small as possible?",
"a": "It makes the sum of squared errors between the known outputs and the network's predictions as small as possible. It does this by adjusting the weights."
}
],
"memorize": [
{
"title": "Classify a new sample with K-NN for two values of K",
"when": "The problem gives a small table of labeled samples, a new sample and two values of K, like K equal to 3 and K equal to 5.",
"steps": [
{
"do": "Write the new sample's feature values.",
"why": "This is because every distance is measured from it."
},
{
"do": "Calculate the Euclidean distance from the new sample to every labeled sample.",
"why": "This is because K-NN uses the closest samples.",
"tex": "d=\\sqrt{(x_1-q_1)^2+(x_2-q_2)^2}"
},
{
"do": "Rank the samples from nearest to farthest.",
"why": "This is because the neighbors are read off the top of this list."
},
{
"do": "Take the K nearest and count each class.",
"why": "This is because the new sample joins the most common class."
},
{
"do": "Give the probability as the share of neighbors in the winning class.",
"why": "This is because the question asks how sure the classification is.",
"tex": "P=\\frac{\\text{votes for the winning class}}{K}"
},
{
"do": "Repeat with the second K and say whether the class changed.",
"why": "This is because a different K can change the vote."
}
],
"example": {
"source": "Session 23 lecture exercise (page 35)",
"prompt": "Seven tumor samples have dimensionless size and irregularity scores and a known diagnosis. A new sample has scores (4, 4). Classify it with K-NN and the Euclidean distance for \\(K=3\\) and for \\(K=5\\), and give the probability each time.",
"table": {
"headers": [
"Sample",
"Size score",
"Irregularity score",
"Diagnosis"
],
"rows": [
[
"A",
"4",
"3",
"Benign"
],
[
"B",
"3",
"3",
"Benign"
],
[
"C",
"4",
"5",
"Malignant"
],
[
"D",
"6",
"4",
"Malignant"
],
[
"E",
"5",
"6",
"Malignant"
],
[
"F",
"1",
"3",
"Benign"
],
[
"G",
"7",
"7",
"Malignant"
]
]
},
"steps": [
{
"say": "The new sample has size 4 and irregularity 4. The scores are already dimensionless, so no scaling is needed.",
"work": [
"q=(4,4)"
]
},
{
"say": "The same formula is used for all seven samples.",
"work": [
"d=\\sqrt{(x_1-q_1)^2+(x_2-q_2)^2}",
"d_A=\\sqrt{(4-4)^2+(4-3)^2}=\\sqrt{1}=1",
"d_B=\\sqrt{(4-3)^2+(4-3)^2}=\\sqrt{2}=1.4142",
"d_C=\\sqrt{(4-4)^2+(4-5)^2}=\\sqrt{1}=1",
"d_D=\\sqrt{(4-6)^2+(4-4)^2}=\\sqrt{4}=2",
"d_E=\\sqrt{(4-5)^2+(4-6)^2}=\\sqrt{5}=2.2361",
"d_F=\\sqrt{(4-1)^2+(4-3)^2}=\\sqrt{10}=3.1623",
"d_G=\\sqrt{(4-7)^2+(4-7)^2}=\\sqrt{18}=4.2426"
]
},
{
"say": "A and C tie for nearest at a distance of 1, so the tie does not matter for K of 3 or 5. B is third, D fourth and E fifth.",
"work": [
"d_A=d_C=1<d_B=1.4142<d_D=2<d_E=2.2361<d_F=3.1623<d_G=4.2426"
]
},
{
"say": "With K of 3 the neighbors are A, C and B. Two are benign and one is malignant, so the new sample is benign.",
"work": [
"K=3,\\quad A=\\text{Benign},\\quad C=\\text{Malignant},\\quad B=\\text{Benign}",
"\\text{Benign }2,\\quad \\text{Malignant }1"
]
},
{
"say": "Benign has 2 of the 3 votes, so the probability is 2 in 3.",
"work": [
"P=\\frac{\\text{votes for the winning class}}{K}",
"P(\\text{Benign})=\\frac{2}{3}=0.6667"
]
},
{
"say": "With K of 5, D and E join and both are malignant, so malignant wins 3 to 2. The class changes from benign to malignant, so the choice of K matters here.",
"work": [
"K=5,\\quad A=\\text{B},\\ C=\\text{M},\\ B=\\text{B},\\ D=\\text{M},\\ E=\\text{M}",
"P(\\text{Malignant})=\\frac{3}{5}=0.6"
]
}
]
}
},
{
"title": "Read a confusion matrix",
"when": "The problem gives a table of actual classes against predicted classes.",
"steps": [
{
"do": "Decide which class is positive, like malignant.",
"why": "This is because sensitivity and specificity depend on that choice."
},
{
"do": "Find TP, TN, FP and FN in the table.",
"why": "This is because every measure is built from these four counts."
},
{
"do": "Calculate accuracy and the error rate.",
"why": "This is because they summarize all the calls together.",
"tex": "\\text{accuracy}=\\frac{TP+TN}{TP+TN+FP+FN},\\quad \\text{error rate}=\\frac{FP+FN}{TP+TN+FP+FN}"
},
{
"do": "Calculate sensitivity.",
"why": "This is because it shows how many real positives were caught.",
"tex": "\\text{sensitivity}=\\frac{TP}{TP+FN}"
},
{
"do": "Calculate specificity.",
"why": "This is because it shows how many real negatives were cleared.",
"tex": "\\text{specificity}=\\frac{TN}{TN+FP}"
},
{
"do": "Say which errors matter most, like missed cancers.",
"why": "This is because accuracy alone can hide a weak sensitivity."
}
],
"example": {
"source": "Session 23 lecture example (page 17)",
"prompt": "K-NN with \\(K=21\\) on min-max scaled breast cancer data is tested on 100 samples. CrossTable() gives the actual diagnosis in rows and the predicted diagnosis in columns. Find the accuracy, error rate, sensitivity and specificity.",
"table": {
"headers": [
"Actual by predicted",
"Benign",
"Malignant",
"Row total"
],
"rows": [
[
"Benign",
"61",
"0",
"61"
],
[
"Malignant",
"2",
"37",
"39"
],
[
"Column total",
"63",
"37",
"100"
]
]
},
"steps": [
{
"say": "Malignant is the positive class because the test is meant to find cancer.",
"work": [
"\\text{positive}=\\text{Malignant}"
]
},
{
"say": "Rows are the truth and columns are the call. The 2 malignant samples called benign are the false negatives.",
"work": [
"TP=37,\\quad TN=61,\\quad FP=0,\\quad FN=2"
]
},
{
"say": "The two diagonal cells are correct, so 98 of 100 calls are right. The two errors give an error rate of 0.02.",
"work": [
"\\text{accuracy}=\\frac{TP+TN}{TP+TN+FP+FN}=\\frac{37+61}{37+61+0+2}=\\frac{98}{100}=0.98",
"\\text{error rate}=\\frac{FP+FN}{TP+TN+FP+FN}=\\frac{0+2}{100}=0.02"
]
},
{
"say": "Only the actual malignant row is used. The model caught 37 of the 39 cancers, matching the 0.949 printed in that row.",
"work": [
"\\text{sensitivity}=\\frac{TP}{TP+FN}=\\frac{37}{37+2}=\\frac{37}{39}=0.9487"
]
},
{
"say": "Only the actual benign row is used. All 61 benign samples were cleared, so no false alarms happened.",
"work": [
"\\text{specificity}=\\frac{TN}{TN+FP}=\\frac{61}{61+0}=1"
]
},
{
"say": "Both errors are cancers called benign, and a missed cancer delays treatment. So the sensitivity of 0.9487 matters more here than the high accuracy of 0.98.",
"work": [
"FN=2,\\quad FP=0"
]
}
]
}
},
{
"title": "Run K-NN in R",
"when": "The problem asks for the R steps to classify test data with knn().",
"steps": [
{
"do": "Read the data, drop the id column and turn the class column into a factor.",
"why": "This is because knn() needs the true classes as a factor and the id is not a feature."
},
{
"do": "Scale the features with min-max or z-scores.",
"why": "This is because features with large numbers would dominate the distance.",
"tex": "x'=\\frac{x-\\min(x)}{\\max(x)-\\min(x)},\\quad z=\\frac{x-\\bar x}{s}"
},
{
"do": "Split the rows into a training set and a test set, with their labels.",
"why": "This is because the model must be checked on samples it has not seen."
},
{
"do": "Run knn() with train, test, cl, k and prob set to TRUE.",
"why": "This is because it returns the predicted classes and the vote shares.",
"tex": "\\texttt{knn(train, test, cl, k, prob=TRUE)}"
},
{
"do": "Cross-tabulate the test labels against the predictions with CrossTable().",
"why": "This is because that table is the confusion matrix."
},
{
"do": "Try another scaling or another K and compare the missed cancers.",
"why": "This is because a different choice can change which errors the model makes."
}
],
"example": {
"source": "Session 23 lecture example (pages 12 to 20) and the course script BreastCancerClassification.R",
"prompt": "The Wisconsin breast cancer file wisc_bc_data.csv has 569 fine needle biopsy samples with an id, a diagnosis (B or M) and 30 numeric features. Write the R steps to classify the last 100 samples with knn() and evaluate the result.",
"steps": [
{
"say": "str() shows 569 rows and 32 columns with the id in column 1. Dropping the id leaves the diagnosis in column 1 and the 30 features in columns 2 to 31.",
"work": [
"\\texttt{wbcd <- read.csv(\"wisc\\_bc\\_data.csv\", stringsAsFactors = FALSE)}",
"\\texttt{wbcd <- wbcd[-1]}",
"\\texttt{wbcd\\$diagnosis <- factor(wbcd\\$diagnosis, levels = c(\"B\", \"M\"),}",
"\\texttt{\\ \\ \\ \\ labels = c(\"Benign\", \"Malignant\"))}",
"\\text{table() gives Benign }357,\\ \\text{Malignant }212,\\quad 357+212=569"
]
},
{
"say": "The normalize() function maps every feature onto 0 to 1. For radius_mean the minimum is 6.981 and the maximum 28.110, so its mean of 14.127 becomes 0.3382.",
"work": [
"x'=\\frac{x-\\min(x)}{\\max(x)-\\min(x)}",
"\\texttt{normalize <- function(x) \\{ return ((x - min(x)) / (max(x) - min(x))) \\}}",
"\\texttt{wbcd\\_n <- as.data.frame(lapply(wbcd[2:31], normalize))}",
"x'=\\frac{14.127-6.981}{28.110-6.981}=\\frac{7.146}{21.129}=0.3382"
]
},
{
"say": "The first 469 rows train the model and the last 100 test it. The labels come from column 1, which works only because the id was dropped.",
"work": [
"\\texttt{wbcd\\_train <- wbcd\\_n[1:469, ]}",
"\\texttt{wbcd\\_test <- wbcd\\_n[470:569, ]}",
"\\texttt{wbcd\\_train\\_labels <- wbcd[1:469, 1]}",
"\\texttt{wbcd\\_test\\_labels <- wbcd[470:569, 1]}",
"469+100=569"
]
},
{
"say": "Each test sample gets the plurality class of its 21 nearest training samples. With prob set to TRUE, R also keeps the share of the 21 votes for the winning class.",
"work": [
"\\texttt{wbcd\\_test\\_pred <- knn(train = wbcd\\_train, test = wbcd\\_test,}",
"\\texttt{\\ \\ \\ \\ cl = wbcd\\_train\\_labels, k = 21, prob = TRUE)}",
"\\texttt{prob\\_test <- attr(wbcd\\_test\\_pred, \"prob\")}"
]
},
{
"say": "The table puts the true labels in rows and the predictions in columns. It shows 98 of 100 correct, and both errors are cancers called benign.",
"work": [
"\\texttt{CrossTable(x = wbcd\\_test\\_labels, y = wbcd\\_test\\_pred, prop.chisq = FALSE)}",
"TN=61,\\quad FP=0,\\quad FN=2,\\quad TP=37",
"\\text{accuracy}=\\frac{61+37}{100}=0.98"
]
},
{
"say": "z-scores raise the missed cancers from 2 to 5, so min-max scaling works better here. Going back to min-max, K of 1 misses 1 cancer but adds 3 false alarms, and K of 27 misses 4.",
"work": [
"\\texttt{wbcd\\_z <- as.data.frame(scale(wbcd[-1]))}",
"\\text{z-scores},\\ K=21\\ \\ FN=5,\\ FP=0,\\ \\text{accuracy}=\\frac{61+34}{100}=0.95",
"\\text{min-max},\\ K=1\\ \\ FN=1,\\ FP=3,\\ \\text{accuracy}=\\frac{58+38}{100}=0.96",
"\\text{min-max},\\ K=27\\ \\ FN=4,\\ FP=0,\\ \\text{accuracy}=\\frac{61+35}{100}=0.96"
]
}
]
}
}
]
},
{
"id": 24,
"tier": "m2b",
"title": "Nonparametric methods based on ranks",
"lead": "When data are not Normal, you can replace the values with their ranks and test the ranks instead. The Mann-Whitney test compares two different groups, and the Wilcoxon test compares two measurements on the same subjects.",
"topics": [
{
"title": "Parametric versus nonparametric methods",
"blocks": [
{
"pages": [
2,
3
],
"main": "**The t and F tests are parametric, because their sampling distributions were derived assuming the data are Normal.** When that assumption fails, you rank the observations and use a method for ordinal data. These rank methods are called **nonparametric** because they do not assume a particular distribution.",
"sub": [
"The Mann-Whitney rank-sum test replaces the unpaired t test. The Wilcoxon signed-rank test replaces the paired t test."
]
},
{
"pages": [
4
],
"main": "**Some populations are clearly not Normal.** The Martian heights spread evenly on both sides of their mean of 40 cm. The Jovian heights pile up near 35 cm and trail off to the right, so their mean of 37.6 cm and SD of 4.5 cm describe them poorly."
}
]
},
{
"title": "Checking whether data are Normal",
"blocks": [
{
"pages": [
5
],
"main": "**One quick check compares the share of data in a range with the share a Normal distribution would have.** About 68 percent of Normal data fall within one SD of the mean, and about 95 percent fall within 1.96 SD."
},
{
"pages": [
6,
7
],
"main": "**A Normal Q-Q plot draws each sample value against the z value it would be expected to have.** If the data are Normal, the points lie close to a straight line. Small departures happen even with Normal data, because of sampling.",
"sub": [
"In R, qqnorm() makes the plot and qqline() adds the reference line.",
"Points that bend away from the line show light tails, heavy tails or skew."
]
},
{
"pages": [
8
],
"main": "**The Shapiro-Wilk test is a formal test of Normality, and its null hypothesis is that the data are Normal.** For the ten values from 60 to 68, W was 0.976 with P of 0.939, so the data count as Normal. Changing 60 to 50 and 68 to 88 gave W of 0.757 with P of 0.0044, so Normality was rejected.",
"sub": [
"Here a small P value is the warning sign, because rejecting the null hypothesis means the data are not Normal."
]
}
]
},
{
"title": "The idea of the Mann-Whitney rank-sum test",
"blocks": [
{
"pages": [
9,
10,
11
],
"main": "**The Mann-Whitney test ranks all observations from both groups together and adds up the ranks of the smaller group.** That sum is the test statistic T. If the treatment has no effect, the smaller group's ranks are just a random pick from all the ranks.",
"sub": [
"In the diuretic example, three placebo people and four drug people get ranks 1 to 7. The placebo ranks are 1, 5 and 3, so T is 9.",
"There are 35 ways to pick 3 ranks out of 7, so T can run from 6 to 18. The most extreme values, 6 and 18, happen once each, so together they have a probability of 2 in 35, or 0.057."
],
"end": "So T of 9 is not unusual, and the drug shows no effect."
}
]
},
{
"title": "Using the T table or the Normal approximation",
"blocks": [
{
"pages": [
12,
13
],
"main": "**When the bigger group has 8 or fewer members, compare T with the two critical values in the T table.** You reject the null hypothesis when T is at or below the lower value or at or above the upper value. For groups of 3 and 4 the pair is 6 and 18, at a P of 0.057."
},
{
"pages": [
13
],
"main": "**When the bigger group has more than 8 members, T is close to Normal, so you turn it into a z value.** The mean of T is the smaller group size times the total size plus 1, divided by 2. You subtract one half from the distance between T and its mean, then divide by sigma T.",
"sub": [
"Subtracting one half is the **continuity correction**. It is needed because T jumps in steps while the Normal curve is smooth.",
"Compare z with the infinity row of the two-tailed t table, like 1.96 for 0.05."
]
}
]
},
{
"title": "Ties",
"blocks": [
{
"pages": [
14,
15,
16
],
"main": "**Tied observations all get the average of the ranks they would have taken.** Two values tied for ranks 2 and 3 both get 2.5. Three values tied for ranks 5, 6 and 7 all get 6.",
"sub": [
"When there are ties and the bigger group has more than 8 members, sigma T gets smaller. You subtract a term built from tau, the number of values in each set of ties.",
"Take one tie of 2 values and two ties of 3 values. The term tau minus 1, times tau, times tau plus 1, is 6 for the first tie and 24 for each other tie, so the sum is 54."
]
}
]
},
{
"title": "The Leboyer childbirth example",
"blocks": [
{
"pages": [
17,
18,
19
],
"main": "**The Leboyer method did not change how many minutes newborns were alert in their first hour.** The times are skewed, so a rank test fits better than a t test. Each group had 20 infants, so the bigger group has more than 8 and the Normal approximation is used.",
"sub": [
"The control ranks add to 374. The mean of T is 20 times 41 over 2, which is 410.",
"Sigma T is the square root of 20 times 20 times 41 over 12, which is 36.97. So z is 36 minus 0.5, over 36.97, which is 0.960.",
"That is below 1.96, so the null hypothesis of no difference is not rejected. With equal groups either sum works, because the Leboyer sum of 446 is just as far from 410."
]
}
]
},
{
"title": "The Wilcoxon signed-rank test",
"blocks": [
{
"pages": [
20,
21
],
"main": "**The Wilcoxon signed-rank test compares two measurements on the same subjects using the ranks of their differences.** You rank the sizes of the differences, give each rank the sign of its difference and add them to get W. If the treatment does nothing, the plus and minus ranks roughly cancel, so W is near 0.",
"sub": [
"In the diuretic example with six people, the signed ranks add to a W of minus 13.",
"With 6 people there are 64 equally likely sign patterns. The W table covers n of 8 or fewer. For n of 6, a size of 19 gives P of 0.062 and 21 gives P of 0.032."
],
"end": "So the size of W, 13, is below 19, and the drug shows no significant effect."
}
]
},
{
"title": "Larger samples, zero differences and ties",
"blocks": [
{
"pages": [
22,
23,
24,
25
],
"main": "**When there are more than 8 subjects, W is close to Normal with a mean of 0.** Its standard deviation is the square root of n times n plus 1 times 2n plus 1, over 6. You subtract one half from the size of W and divide by that standard deviation to get z.",
"sub": [
"A difference of exactly zero is dropped, and n goes down by one for each one dropped.",
"Tied differences get the average of their ranks. The sign is put back only after ranking.",
"With ties and more than 8 subjects, you subtract the sum of tau minus 1, times tau, times tau plus 1, over 12, inside the square root."
]
}
]
},
{
"title": "Platelet aggregation before and after smoking",
"blocks": [
{
"pages": [
26
],
"main": "**The paired t test on 11 people found that platelet aggregation rose after smoking one cigarette.** The mean difference was 10.3 percent with an SD of 8.0 percent, so its standard error was 2.41. The t value of 4.27 beat the cutoff of 4.144 at 0.002 with 10 degrees of freedom, so P is below 0.002."
},
{
"pages": [
27
],
"main": "**The Wilcoxon signed-rank test on the same differences reaches the same conclusion without assuming Normality.** Only one difference, minus 1, is negative, and it has rank 1. The ranks 1 to 11 add to 66, so W is 66 minus 2, which is 64.",
"sub": [
"There are 11 nonzero differences, so the Normal approximation is used. The two 4s share rank 3.5 and the two 15s share rank 8.5, which makes two ties of 2.",
"Sigma W is the square root of 506 minus 1, which is 22.47. So z is 63.5 over 22.47, which is 2.83.",
"That is above 2.807, the infinity row value at 0.005, so P is below 0.005 and the null hypothesis is rejected."
],
"end": "So both tests say smoking one cigarette increases platelet aggregation."
}
]
}
],
"questions": [
{
"q": "When should you use a nonparametric test instead of a t test?",
"a": "Use it when the data are not Normal, like strongly skewed data. This is because the t and F distributions were derived assuming Normal data."
},
{
"q": "What is the null hypothesis of the Shapiro-Wilk test, and what does a small P value mean?",
"a": "The null hypothesis is that the data are Normally distributed. A small P value rejects it, so the data are not Normal."
},
{
"q": "What is T in the Mann-Whitney test?",
"a": "T is the sum of the ranks of the smaller group. All observations from both groups are ranked together first."
},
{
"q": "When do you use the T table and when do you use the Normal approximation?",
"a": "Use the T table when the bigger group has 8 or fewer members. Use the Normal approximation with the continuity correction when it has more than 8."
},
{
"q": "What is the continuity correction?",
"a": "It is the one half subtracted from the distance between the statistic and its mean before dividing by the standard deviation. It is used because T and W jump in steps while the Normal curve is smooth."
},
{
"q": "How are zero differences and ties handled in the Wilcoxon test?",
"a": "Zero differences are dropped, and n goes down by one for each. Tied sizes get the average of their ranks, and the sign is attached after ranking."
},
{
"q": "Why does W have a mean of 0 when the treatment has no effect?",
"a": "Each difference is then as likely to be positive as negative. So the plus and minus ranks cancel on average."
}
],
"memorize": [
{
"title": "Mann-Whitney rank-sum test with the T table",
"when": "Two different groups are compared, the data are not Normal, and the bigger group has 8 or fewer members.",
"steps": [
{
"do": "Name the Mann-Whitney rank-sum test and write the null hypothesis that the two groups have the same distribution.",
"why": "This is because the groups hold different people and the data are not Normal."
},
{
"do": "Rank all observations together from smallest to largest, averaging the ranks of ties.",
"why": "This is because the test works on ranks, not values."
},
{
"do": "Add the ranks of the smaller group to get T.",
"why": "This is because T is the test statistic.",
"tex": "T=\\sum R_{\\text{smaller group}}"
},
{
"do": "Look up the critical pair for the two group sizes in the two-tailed T table.",
"why": "This is because the table lists the extreme values of T for small groups.",
"table": "Use the class Mann-Whitney T table (two-tailed). Find the row for the smaller group size and then the larger group size. The pair of critical values is read in the column near 0.05, and the next column gives the exact P for that pair.",
"tablePath": "sources/tables/MannWhitney_RankSumT_Table.pdf"
},
{
"do": "Reject if T is at or below the lower value or at or above the upper value, then write the conclusion.",
"why": "This is because those values of T are rare when the null hypothesis is true."
}
],
"example": {
"source": "Session 24 lecture example (pages 9 to 12)",
"prompt": "Daily urine production (mL/day) is measured in three people given a placebo and four different people given a drug. Without assuming Normal populations, does the drug change urine production at a level near 0.05?",
"table": {
"headers": [
"Placebo (mL/day)",
"Drug (mL/day)"
],
"rows": [
[
"1000",
"1400"
],
[
"1380",
"1600"
],
[
"1200",
"1180"
],
[
"",
"1220"
]
]
},
"steps": [
{
"say": "This is a Mann-Whitney rank-sum test because the two groups hold different people and Normality is not assumed. The null hypothesis is that urine production has the same distribution with placebo and drug.",
"work": [
"H_0:\\text{same distribution with placebo and drug}"
]
},
{
"say": "All seven values are ranked in one list regardless of group. No two values are equal, so there are no ties to average.",
"work": [
"1000,\\ 1180,\\ 1200,\\ 1220,\\ 1380,\\ 1400,\\ 1600",
"\\text{ranks}\\ \\ 1,\\ 2,\\ 3,\\ 4,\\ 5,\\ 6,\\ 7",
"\\text{placebo ranks}\\ \\ 1000\\to1,\\ 1380\\to5,\\ 1200\\to3"
]
},
{
"say": "The placebo group is the smaller group, so T is the sum of its three ranks.",
"work": [
"T=\\sum R_{\\text{smaller group}}",
"T=1+5+3=9"
]
},
{
"say": "In the row with 3 in the smaller group and 4 in the bigger group, the column near 0.05 gives the pair 6 and 18 with P of 0.057.",
"work": [
"n_S=3,\\quad n_B=4",
"\\text{critical values}\\ \\ 6\\ \\text{and}\\ 18,\\quad P=0.057"
]
},
{
"say": "T of 9 lies strictly between 6 and 18, so do not reject the null hypothesis. These data do not show that the drug changes daily urine production.",
"work": [
"6<9<18",
"P>0.05"
]
}
]
}
},
{
"title": "Mann-Whitney test with the Normal approximation",
"when": "The bigger group has more than 8 members, like the Leboyer example with 20 infants per group.",
"steps": [
{
"do": "Rank all observations together and add the ranks of the smaller group to get T.",
"why": "This is because T is the same statistic as before."
},
{
"do": "Calculate the mean of T.",
"why": "This is because z measures how far T is from its mean.",
"tex": "\\mu_T=\\frac{n_S(n_S+n_B+1)}{2}"
},
{
"do": "Calculate sigma T, with the tie correction if there are ties.",
"why": "This is because ties make T vary less.",
"tex": "\\sigma_T=\\sqrt{\\frac{n_Sn_B(n_S+n_B+1)}{12}},\\quad \\sigma_T=\\sqrt{\\frac{n_Sn_B(N+1)}{12}-\\frac{n_Sn_B}{12N(N-1)}\\sum(\\tau_i-1)\\tau_i(\\tau_i+1)}\\ \\text{(ties)},\\quad N=n_S+n_B"
},
{
"do": "Calculate z with the continuity correction.",
"why": "This is because T jumps in steps while the Normal curve is smooth.",
"tex": "z_T=\\frac{|T-\\mu_T|-\\frac12}{\\sigma_T}"
},
{
"do": "Compare z with the infinity row of the two-tailed t table and conclude.",
"why": "This is because the infinity row gives the Normal cutoffs.",
"table": "Use the class t table, infinity row on PDF page 2. The 0.05 column gives 1.96 and the 0.01 column gives 2.576.",
"tablePath": "sources/tables/t_table.pdf#page=2"
}
],
"example": {
"source": "Session 24 lecture example (pages 17 to 19)",
"prompt": "Minutes of alert behavior in the first hour of life are recorded for 20 infants delivered conventionally (control) and 20 delivered by the Leboyer method. The times are skewed. Do the distributions differ at the two-sided 0.05 level?",
"table": {
"headers": [
"Control (min)",
"Leboyer (min)"
],
"rows": [
[
"5.0",
"2.0"
],
[
"10.1",
"19.0"
],
[
"17.7",
"29.7"
],
[
"20.3",
"32.1"
],
[
"22.0",
"35.4"
],
[
"24.9",
"36.7"
],
[
"26.5",
"38.5"
],
[
"30.8",
"40.2"
],
[
"34.2",
"42.1"
],
[
"35.0",
"43.0"
],
[
"36.6",
"44.4"
],
[
"37.9",
"45.6"
],
[
"40.4",
"46.7"
],
[
"45.5",
"47.1"
],
[
"49.3",
"48.0"
],
[
"51.1",
"49.0"
],
[
"53.1",
"50.9"
],
[
"55.0",
"51.2"
],
[
"56.7",
"52.5"
],
[
"58.0",
"53.3"
]
]
},
"steps": [
{
"say": "All 40 times are ranked together and no two are equal. The groups are the same size, so the control group is used for T.",
"work": [
"\\text{control ranks}\\ \\ 2,\\ 3,\\ 4,\\ 6,\\ 7,\\ 8,\\ 9,\\ 11,\\ 13,\\ 14,",
"\\quad 16,\\ 18,\\ 21,\\ 25,\\ 31,\\ 33,\\ 36,\\ 38,\\ 39,\\ 40",
"T=2+3+4+6+7+8+9+11+13+14+16+18+21+25+31+33+36+38+39+40=374"
]
},
{
"say": "If the birth method has no effect, the control rank sum would average 410.",
"work": [
"\\mu_T=\\frac{n_S(n_S+n_B+1)}{2}",
"\\mu_T=\\frac{20(20+20+1)}{2}=\\frac{820}{2}=410"
]
},
{
"say": "No two times are equal, so the simple form is used and no tie correction is needed.",
"work": [
"\\sigma_T=\\sqrt{\\frac{n_Sn_B(n_S+n_B+1)}{12}}",
"\\sigma_T=\\sqrt{\\frac{20(20)(41)}{12}}=\\sqrt{1366.67}=36.9685"
]
},
{
"say": "T is 36 below its mean. The continuity correction takes off one half, so z is a little under 1.",
"work": [
"z_T=\\frac{|T-\\mu_T|-\\frac12}{\\sigma_T}",
"z_T=\\frac{|374-410|-0.5}{36.9685}=\\frac{35.5}{36.9685}=0.9603"
]
},
{
"say": "Because 0.9603 is below 1.96, do not reject the null hypothesis. The data do not show a difference in alert minutes between Leboyer and control deliveries.",
"work": [
"z_{0.05}=1.9600\\ \\ (\\text{row }\\infty,\\ \\text{column }0.05)",
"|z_T|=0.9603<1.9600",
"t_{0.50}(\\infty)=0.6745<0.9603<t_{0.20}(\\infty)=1.2816",
"0.20<P<0.50"
]
}
]
}
},
{
"title": "Wilcoxon signed-rank test",
"when": "The same subjects are measured twice and the differences are not Normal, like platelet aggregation before and after smoking.",
"steps": [
{
"do": "Name the Wilcoxon signed-rank test and write the null hypothesis of no change.",
"why": "This is because each subject gives one difference."
},
{
"do": "Subtract to get each difference and drop any zeros, reducing n.",
"why": "This is because a zero difference has no sign."
},
{
"do": "Rank the sizes of the differences, averaging the ranks of ties.",
"why": "This is because the size of each change is ranked before its sign is used."
},
{
"do": "Give each rank the sign of its difference and add them to get W.",
"why": "This is because W shows whether the changes lean one way.",
"tex": "W=\\sum_i \\operatorname{sign}(d_i)\\,R_i"
},
{
"do": "If n is 8 or fewer, compare the size of W with the W table.",
"why": "This is because the table gives exact cutoffs for small n.",
"table": "Use the class Wilcoxon W table (two-tailed). Find the row for n, the number of nonzero differences, and compare the size of W with the critical value. The P column gives the exact probability for that cutoff.",
"tablePath": "sources/tables/WilcoxonW_Table.pdf"
},
{
"do": "If n is more than 8, calculate sigma W with any tie correction, then z.",
"why": "This is because W is close to Normal with a mean of 0 for larger n.",
"tex": "\\sigma_W=\\sqrt{\\frac{n(n+1)(2n+1)}{6}-\\sum\\frac{(\\tau_i-1)\\tau_i(\\tau_i+1)}{12}},\\quad z_W=\\frac{|W|-\\frac12}{\\sigma_W}"
},
{
"do": "Compare z with the infinity row of the two-tailed t table and write the conclusion with a P range.",
"why": "This is because the conclusion must say whether the change is real.",
"table": "Use the class t table, infinity row on PDF page 2. The 0.05 column gives 1.96 and the 0.01 column gives 2.576.",
"tablePath": "sources/tables/t_table.pdf#page=2"
}
],
"example": {
"source": "Session 24 lecture exercise (page 27), data on page 26",
"prompt": "Eleven people have maximum percent platelet aggregation measured before and after smoking one cigarette. Use the Wilcoxon signed-rank test at the two-sided 0.05 level to decide whether smoking changes platelet aggregation.",
"table": {
"headers": [
"Person",
"Before (%)",
"After (%)"
],
"rows": [
[
"1",
"25",
"27"
],
[
"2",
"25",
"29"
],
[
"3",
"27",
"37"
],
[
"4",
"44",
"56"
],
[
"5",
"30",
"46"
],
[
"6",
"67",
"82"
],
[
"7",
"53",
"57"
],
[
"8",
"53",
"80"
],
[
"9",
"52",
"61"
],
[
"10",
"60",
"59"
],
[
"11",
"28",
"43"
]
]
},
"steps": [
{
"say": "Each person was measured before and after, so each gives one difference and the signed-rank test fits. The null hypothesis is that smoking causes no change in platelet aggregation.",
"work": [
"H_0:\\text{no difference before and after smoking}"
]
},
{
"say": "No difference is zero, so n stays at 11.",
"work": [
"d_1=27-25=2,\\quad d_2=29-25=4,\\quad d_3=37-27=10,\\quad d_4=56-44=12",
"d_5=46-30=16,\\quad d_6=82-67=15,\\quad d_7=57-53=4,\\quad d_8=80-53=27",
"d_9=61-52=9,\\quad d_{10}=59-60=-1,\\quad d_{11}=43-28=15",
"n=11"
]
},
{
"say": "The two 4s share ranks 3 and 4, and the two 15s share ranks 8 and 9. The change of minus 1 has the smallest size, so it gets rank 1.",
"work": [
"|d|\\ \\text{in order}\\ \\ 1,\\ 2,\\ 4,\\ 4,\\ 9,\\ 10,\\ 12,\\ 15,\\ 15,\\ 16,\\ 27",
"\\text{ranks of the 4s}=\\frac{3+4}{2}=3.5,\\quad \\text{ranks of the 15s}=\\frac{8+9}{2}=8.5",
"\\text{ranks}\\ \\ 1,\\ 2,\\ 3.5,\\ 3.5,\\ 5,\\ 6,\\ 7,\\ 8.5,\\ 8.5,\\ 10,\\ 11"
]
},
{
"say": "Only person 10 went down, so only rank 1 is negative. W is large and positive, so the changes lean strongly upward.",
"work": [
"W=\\sum_i \\operatorname{sign}(d_i)\\,R_i",
"W=2+3.5+6+7+10+8.5+3.5+11+5-1+8.5=64"
]
},
{
"say": "Here n is 11, which is more than 8, so the W table does not apply and the Normal approximation is used in the next step.",
"work": [
"n=11>8"
]
},
{
"say": "There are two sets of ties, each of size 2, so the variance drops by 1 from 506 to 505. The mean of W is 0, so only the half is subtracted.",
"work": [
"\\sigma_W=\\sqrt{\\frac{n(n+1)(2n+1)}{6}-\\sum\\frac{(\\tau_i-1)\\tau_i(\\tau_i+1)}{12}}",
"\\sigma_W=\\sqrt{\\frac{11(12)(23)}{6}-\\frac{(1)(2)(3)+(1)(2)(3)}{12}}=\\sqrt{506-1}=\\sqrt{505}=22.4722",
"z_W=\\frac{|W|-\\frac12}{\\sigma_W}=\\frac{64-0.5}{22.4722}=2.8257"
]
},
{
"say": "Because 2.8257 is above 1.96, reject the null hypothesis. It passes the 0.005 cutoff but not the 0.002 cutoff, so smoking increases platelet aggregation with P between 0.002 and 0.005.",
"work": [
"z_{0.05}=1.9600\\ \\ (\\text{row }\\infty,\\ \\text{column }0.05)",
"|z_W|=2.8257>1.9600",
"t_{0.005}(\\infty)=2.8070<2.8257<t_{0.002}(\\infty)=3.0902",
"0.002<P<0.005"
]
}
]
}
},
{
"title": "Check Normality before choosing a test",
"when": "The problem asks whether a t test is appropriate for the data.",
"steps": [
{
"do": "Make a Normal Q-Q plot with qqnorm() and qqline().",
"why": "This is because Normal data fall close to a straight line."
},
{
"do": "Run shapiro.test() and state its null hypothesis that the data are Normal.",
"why": "This is because it gives a formal P value."
},
{
"do": "If P is small, use the rank test that matches the design.",
"why": "This is because the t test assumes Normal data."
}
],
"example": {
"source": "Session 24 lecture example (pages 5, 7 and 8)",
"prompt": "Two samples of ten values are checked for Normality. Sample 2 equals sample 1 except that 60 is replaced by 50 and 68 by 88. Is a t test appropriate for each sample?",
"table": {
"headers": [
"Order",
"Sample 1",
"Sample 2"
],
"rows": [
[
"1",
"60",
"50"
],
[
"2",
"62",
"62"
],
[
"3",
"62",
"62"
],
[
"4",
"63",
"63"
],
[
"5",
"64",
"64"
],
[
"6",
"64",
"64"
],
[
"7",
"65",
"65"
],
[
"8",
"65",
"65"
],
[
"9",
"67",
"67"
],
[
"10",
"68",
"88"
]
]
},
"steps": [
{
"say": "qqnorm() plots each sorted value against a Normal quantile running from about minus 1.55 to plus 1.55. Sample 1 lies close to the line, but sample 2 has 50 and 88 far off it.",
"work": [
"\\texttt{qqnorm(x); qqline(x)}",
"p_1=\\frac{1-\\frac38}{10+\\frac14}=0.06098",
"z_1=-1.5466,\\quad z_{10}=1.5466"
]
},
{
"say": "The null hypothesis is that the data come from a Normal distribution. Sample 1 has a large P, so Normality is not rejected, while sample 2 has a P far below 0.05.",
"work": [
"H_0:\\text{the data come from a Normal distribution}",
"\\text{sample 1}\\ \\ W=0.97577,\\quad P=0.9386>0.05",
"\\text{sample 2}\\ \\ W=0.75726,\\quad P=0.004374<0.05"
]
},
{
"say": "Sample 1 is consistent with Normal data, so a t test is fine. Sample 2 is not Normal, so use the Mann-Whitney test for two separate groups or the Wilcoxon signed-rank test for paired data.",
"work": [
"P=0.004374<0.05"
]
}
]
}
}
]
}
]
};
