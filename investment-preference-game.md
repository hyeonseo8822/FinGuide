# Find Your Investment Preference

## Overview

Replace the existing stock simulation feature with a new educational game called **Find Your Investment Preference**.

The purpose of this game is to help users understand their investment tendencies through a simple card-selection experience.

---

## Game Flow

### Step 1. Pay Entry Fee

* User starts with a coin balance.
* Playing the game costs **5,000 🪙**.
* Deduct 5,000 🪙 before the game begins.

---

### Step 2. Choose an Investment Section

Display three investment sections:

1. ELS
2. ETF
3. Savings Deposit

Each section should display:

* Investment name
* Risk level
* Potential reward
* Brief description

---

## Section Configuration

### ELS

**High Risk · High Return**

Reward: Highest payout

Cards:

* O
* X
* X

Description:

* Lower chance of success
* Higher reward when successful

---

### ETF

**Medium Risk · Medium Return**

Reward: Medium payout

Cards:

* O
* O
* X

Description:

* Balanced risk and reward
* Moderate success rate

---

### Savings Deposit

**Low Risk · Low Return**

Reward: Small guaranteed interest (Alpha)

Cards:

* O
* O
* O

Description:

* Safe choice
* Guaranteed positive outcome

---

## Step 3. Select a Card

After selecting a section:

* Show 3 face-down cards.
* User chooses one card.
* Selected card flips with a smooth animation.
* Reveal either O or X.

---

## Reward Rules

### ELS

If O:

* Award highest reward.

If X:

* No reward.

---

### ETF

If O:

* Award medium reward.

If X:

* No reward.

---

### Savings Deposit

If O:

* Award small interest reward.

Since all cards are O:

* User always receives the reward.

---

# Investment Personality Analysis

After card selection, display personality analysis based on the chosen section.

The result should appear regardless of whether the card revealed O or X.

---

## If User Chose ELS

### Investor Type

Risk-Seeking Investor

### Analysis

You are a risk-seeking investor.

You are willing to accept higher risk in exchange for potentially higher returns.

### Recommendation

ELS may suit your investment style.

---

## If User Chose ETF

### Investor Type

Risk-Neutral Investor

### Analysis

You are a risk-neutral investor.

You prefer balancing risk and reward.

### Recommendation

ETF may suit your investment style.

---

## If User Chose Savings Deposit

### Investor Type

Risk-Averse Investor

### Analysis

You are a risk-averse investor.

You prefer stability and protecting your money.

### Recommendation

Savings deposits may suit your investment style.

---

# Beginner-Friendly Investment Guide

Display this section below the personality result.

---

## ELS

ELS is an investment product that can provide high returns, but there is also a chance of loss.

Example:

Choosing ELS is like selecting the hard difficulty in a game. It is more challenging, but the reward can be much bigger.

---

## ETF

ETF is a fund that invests in many companies at once.

Example:

Buying an ETF is like purchasing a snack variety pack instead of choosing only one snack.

---

## Savings Deposit

A savings deposit keeps your money safe and earns a small amount of interest.

Example:

It is like putting money into a piggy bank and receiving a small bonus later.

---

# UI Requirements

* Remove the existing stock simulation feature completely.
* Remove all current Home screen content.
* Replace Home with the Find Your Investment Preference game.
* All cards should initially appear face down.
* Use a smooth card-flip animation.
* Clearly display reward amounts before selection.
* Use large icons and beginner-friendly visuals.
* Keep the interface simple and easy to understand.
* Show the investment personality result in a prominent result card.
* Make the experience suitable for students and first-time investors.
