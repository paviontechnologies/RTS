#!/usr/bin/env python3
"""
Pavion RTS – Gross Margin & Spread Calculator
Calculates hourly spread, gross margin percentage, and recruiter/account manager commission splits.
"""

def calculate_deal_profitability(bill_rate: float, pay_rate: float, burden_pct: float = 14.5, hours_per_year: int = 2080):
    burden_cost = pay_rate * (burden_pct / 100.0)
    total_cost = pay_rate + burden_cost
    hourly_spread = bill_rate - total_cost
    gross_margin_pct = (hourly_spread / bill_rate) * 100.0 if bill_rate > 0 else 0
    annual_gross_profit = hourly_spread * hours_per_year

    recruiter_commission = annual_gross_profit * 0.05
    am_commission = annual_gross_profit * 0.05

    return {
        "bill_rate": bill_rate,
        "pay_rate": pay_rate,
        "burden_rate": round(burden_cost, 2),
        "total_cost": round(total_cost, 2),
        "hourly_spread": round(hourly_spread, 2),
        "gross_margin_percentage": round(gross_margin_pct, 2),
        "annual_gross_profit": round(annual_gross_profit, 2),
        "recruiter_commission_est": round(recruiter_commission, 2),
        "account_manager_commission_est": round(am_commission, 2)
    }

if __name__ == "__main__":
    result = calculate_deal_profitability(bill_rate=115.00, pay_rate=80.00)
    print("=== Pavion RTS Deal Profitability ===")
    for k, v in result.items():
        print(f"  {k}: {v}")
