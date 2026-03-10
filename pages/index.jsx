// Sua AI - F&B 원가율 계산 SaaS MVP v2.1 (모바일 최적화)
import { useState } from "react";

const initialIngredients = [
  { id: 1, name: "돼지고기 삼겹살", unit: "g", unitCost: 0.028, quantity: 200 },
  { id: 2, name: "상추", unit: "g", unitCost: 0.005, quantity: 50 },
  { id: 3, name: "쌈장", unit: "g", unitCost: 0.012, quantity: 30 },
];

const initialStaff = [
  { id: 1, name: "홀 매니저", type: "정규직", monthlySalary: 2800000, hoursPerMonth: 209 },
  { id: 2, name: "주방 파트타이머", type: "시간제", monthlySalary: 0, hoursPerMonth: 80, hourlyWage: 10030 },
];

const TABS = ["원가계산", "인건비", "메뉴관리", "분석"];
const INSURANCE_RATE = 0.1695;
// ✅ Google Forms 링크를 여기에 붙여넣으세요
const FORMS_URL = "https://forms.gle/yF1vPRMfWfKX8iCm8";

function formatKRW(n) {
  if (isNaN(n)) return "0원";
  return Math.round(n).toLocaleString("ko-KR") + "원";
}
function getRating(rate) {
  if (rate <= 28) return { label: "매우 우수", color: "#10b981" };
  if (rate <= 33) return { label: "적정", color: "#3b82f6" };
  if (rate <= 38) return { label: "주의 필요", color: "#f59e0b" };
  return { label: "위험", color: "#ef4444" };
}
function getPrimeCostRating(rate) {
  if (rate <= 55) return { label: "우수", color: "#10b981" };
  if (rate <= 60) return { label: "적정", color: "#3b82f6" };
  if (rate <= 65) return { label: "주의", color: "#f59e0b" };
  return { label: "위험", color: "#ef4444" };
}

const card = { background: "#1a1a2e", border: "1px solid #ffffff10", borderRadius: 16, padding: 16, marginBottom: 12 };
const secTitle = { fontSize: 13, fontWeight: 700, color: "#a5b4fc", marginBottom: 12 };
const lbl = { display: "block", fontSize: 10, color: "#666", fontWeight: 600, marginBottom: 5, letterSpacing: "0.3px", textTransform: "uppercase" };
const inp = { width: "100%", background: "#0d0d14", border: "1px solid #ffffff15", borderRadius: 8, padding: "10px 12px", color: "#f0f0f8", fontSize: 14, outline: "none", boxSizing: "border-box", WebkitAppearance: "none" };

function LaborTab({ laborData, setLaborData }) {
  const { staff, monthlyRevenue, totalCovers, includeInsurance } = laborData;
  const updateStaff = (id, field, value) => setLaborData(prev => ({ ...prev, staff: prev.staff.map(s => s.id === id ? { ...s, [field]: ["name","type"].includes(field) ? value : parseFloat(value)||0 } : s) }));
  const addStaff = () => setLaborData(prev => ({ ...prev, staff: [...prev.staff, { id: Date.now(), name: "", type: "정규직", monthlySalary: 0, hoursPerMonth: 209, hourlyWage: 0 }] }));
  const removeStaff = (id) => setLaborData(prev => ({ ...prev, staff: prev.staff.filter(s => s.id !== id) }));

  const totalBaseSalary = staff.reduce((sum, s) => sum + (s.type === "시간제" ? s.hourlyWage * s.hoursPerMonth : s.monthlySalary), 0);
  const insuranceCost = includeInsurance ? totalBaseSalary * INSURANCE_RATE : 0;
  const totalLaborCost = totalBaseSalary + insuranceCost;
  const totalHours = staff.reduce((sum, s) => sum + s.hoursPerMonth, 0);
  const laborRate = monthlyRevenue > 0 ? (totalLaborCost / monthlyRevenue) * 100 : 0;
  const laborPerCover = totalCovers > 0 ? totalLaborCost / totalCovers : 0;
  const laborProductivity = totalHours > 0 ? monthlyRevenue / totalHours : 0;
  const lRating = getRating(laborRate);

  return (
    <div>
      <div style={card}>
        <h3 style={secTitle}>매장 기본 정보 (월 기준)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div><label style={lbl}>월 총 매출 (원)</label><input type="number" value={monthlyRevenue} onChange={e => setLaborData(p => ({ ...p, monthlyRevenue: parseFloat(e.target.value)||0 }))} style={inp} /></div>
          <div><label style={lbl}>월 총 고객수</label><input type="number" value={totalCovers} onChange={e => setLaborData(p => ({ ...p, totalCovers: parseFloat(e.target.value)||0 }))} style={inp} /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => setLaborData(p => ({ ...p, includeInsurance: !p.includeInsurance }))} style={{ width: 44, height: 24, borderRadius: 12, background: includeInsurance ? "#6366f1" : "#333", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: includeInsurance ? 23 : 3, transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: 12, color: "#aaa" }}>4대보험 + 퇴직금 포함 <span style={{ color: "#666" }}>(+{(INSURANCE_RATE*100).toFixed(1)}%)</span></span>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ ...secTitle, marginBottom: 0 }}>직원 구성</h3>
          <button onClick={addStaff} style={{ background: "#6366f115", border: "1px solid #6366f130", color: "#a5b4fc", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ 추가</button>
        </div>
        {staff.map(s => (
          <div key={s.id} style={{ background: "#ffffff05", borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8 }}>
              <input value={s.name} onChange={e => updateStaff(s.id, "name", e.target.value)} style={inp} placeholder="이름/직책" />
              <select value={s.type} onChange={e => updateStaff(s.id, "type", e.target.value)} style={inp}><option>정규직</option><option>시간제</option></select>
              <button onClick={() => removeStaff(s.id)} style={{ background: "#ff444420", border: "1px solid #ff444430", color: "#ff7777", borderRadius: 6, cursor: "pointer", padding: "0 10px", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><label style={lbl}>{s.type === "시간제" ? "시급 (원)" : "월급 (원)"}</label><input type="number" value={s.type === "시간제" ? s.hourlyWage : s.monthlySalary} onChange={e => updateStaff(s.id, s.type === "시간제" ? "hourlyWage" : "monthlySalary", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>월 근무시간</label><input type="number" value={s.hoursPerMonth} onChange={e => updateStaff(s.id, "hoursPerMonth", e.target.value)} style={inp} /></div>
            </div>
          </div>
        ))}
        <div style={{ borderTop: "1px solid #ffffff10", paddingTop: 10 }}>
          {includeInsurance && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "#888", fontSize: 12 }}>4대보험 + 퇴직금</span><span style={{ fontWeight: 600, color: "#f59e0b", fontSize: 13 }}>+ {formatKRW(insuranceCost)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#a5b4fc", fontSize: 13, fontWeight: 700 }}>총 인건비</span><span style={{ fontSize: 18, fontWeight: 800, color: "#a5b4fc" }}>{formatKRW(totalLaborCost)}</span></div>
        </div>
      </div>

      <div style={{ ...card, background: "linear-gradient(160deg,#1e1e32 0%,#16213e 100%)", border: "1px solid #6366f130" }}>
        <h3 style={secTitle}>인건비 분석 결과</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: `conic-gradient(${lRating.color} ${Math.min(laborRate,100)}%, #ffffff10 0)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 20px ${lRating.color}40` }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#13131f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: lRating.color }}>{laborRate.toFixed(1)}%</div>
              <div style={{ fontSize: 9, color: "#888" }}>인건비율</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-block", background: `${lRating.color}20`, border: `1px solid ${lRating.color}40`, color: lRating.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{lRating.label}</div>
            <div style={{ fontSize: 12, color: "#888" }}>월 총 인건비</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{formatKRW(totalLaborCost)}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "시간당 인건비", value: formatKRW(totalHours > 0 ? totalLaborCost/totalHours : 0), color: "#8b5cf6" },
            { label: "커버당 인건비", value: formatKRW(laborPerCover), color: "#a78bfa" },
            { label: "직원 생산성", value: `${formatKRW(laborProductivity)}/h`, color: "#c4b5fd" },
            { label: "총 근무시간", value: `${totalHours}시간`, color: "#6366f1" },
          ].map((kpi, i) => (
            <div key={i} style={{ background: "#ffffff05", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>{kpi.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={secTitle}>업종별 인건비율 기준</h3>
        {[{ type: "패스트푸드/QSR", range: "25~30%", color: "#10b981" },{ type: "카페/베이커리", range: "28~33%", color: "#3b82f6" },{ type: "캐주얼 다이닝", range: "30~35%", color: "#f59e0b" },{ type: "파인 다이닝", range: "35~40%", color: "#f97316" },{ type: "배달 전문", range: "20~28%", color: "#10b981" }].map((r, i, arr) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < arr.length-1 ? "1px solid #ffffff08" : "none" }}>
            <span style={{ fontSize: 12, color: "#888" }}>{r.type}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuaAI() {
  const [tab, setTab] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [menuName, setMenuName] = useState("삼겹살 구이 (1인분)");
  const [sellingPrice, setSellingPrice] = useState(13000);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [menus, setMenus] = useState([]);
  const [saved, setSaved] = useState(false);
  const [overheadRate, setOverheadRate] = useState(12);
  const [laborData, setLaborData] = useState({ staff: initialStaff, monthlyRevenue: 15000000, totalCovers: 900, includeInsurance: true });

  const totalIngredientCost = ingredients.reduce((sum, ing) => sum + ing.unitCost * ing.quantity, 0);
  const costRate = sellingPrice > 0 ? (totalIngredientCost / sellingPrice) * 100 : 0;
  const totalBaseSalary = laborData.staff.reduce((sum, s) => sum + (s.type === "시간제" ? s.hourlyWage * s.hoursPerMonth : s.monthlySalary), 0);
  const totalLaborCost = totalBaseSalary * (laborData.includeInsurance ? 1 + INSURANCE_RATE : 1);
  const laborRate = laborData.monthlyRevenue > 0 ? (totalLaborCost / laborData.monthlyRevenue) * 100 : 0;
  const primeCost = costRate + laborRate;
  const totalCostRate = primeCost + overheadRate;
  const profitRate = 100 - totalCostRate;
  const profitAmount = sellingPrice * (profitRate / 100);
  const primeRating = getPrimeCostRating(primeCost);
  const rating = getRating(costRate);

  const addIngredient = () => setIngredients([...ingredients, { id: Date.now(), name: "", unit: "g", unitCost: 0, quantity: 0 }]);
  const updateIngredient = (id, field, value) => setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, [field]: ["name","unit"].includes(field) ? value : parseFloat(value)||0 } : ing));
  const removeIngredient = (id) => setIngredients(ingredients.filter(ing => ing.id !== id));
  const saveMenu = () => {
    setMenus([...menus, { id: Date.now(), name: menuName, sellingPrice, ingredientCost: totalIngredientCost, costRate: costRate.toFixed(1), laborRate: laborRate.toFixed(1), primeCost: primeCost.toFixed(1), totalCostRate: totalCostRate.toFixed(1), profitRate: profitRate.toFixed(1) }]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d14", fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif", color: "#f0f0f8" }}>

      {/* 피드백 모달 — 하단 시트 */}
      {showFeedback && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 999, display: "flex", alignItems: "flex-end" }} onClick={() => setShowFeedback(false)}>
          <div style={{ background: "#1a1a2e", border: "1px solid #6366f140", borderRadius: "20px 20px 0 0", padding: "28px 24px 40px", width: "100%", position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#ffffff20", borderRadius: 2, margin: "0 auto 20px" }} />
            <button onClick={() => setShowFeedback(false)} style={{ position: "absolute", top: 16, right: 16, background: "#ffffff10", border: "none", color: "#888", borderRadius: 6, cursor: "pointer", padding: "4px 10px" }}>✕</button>
            <div style={{ fontSize: 28, textAlign: "center", marginBottom: 6 }}>💬</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, textAlign: "center", marginBottom: 6 }}>사용 후기를 들려주세요!</h2>
            <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 20, lineHeight: 1.6 }}>여러분의 의견이 Sua AI를 더 좋게 만들어요 🙏</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {["실제 업무에 사용해보셨나요?","가장 유용한 기능은 무엇인가요?","불편하거나 아쉬운 점이 있나요?","월 얼마라면 결제하실 것 같나요?","지인에게 추천하시겠어요? (NPS)"].map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#ffffff05", borderRadius: 8 }}>
                  <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, minWidth: 20 }}>0{i+1}</span>
                  <span style={{ fontSize: 12, color: "#ccc" }}>{q}</span>
                </div>
              ))}
            </div>
            <a href={FORMS_URL} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>📝 설문 바로 참여하기</button>
            </a>
            <p style={{ fontSize: 11, color: "#555", textAlign: "center", marginTop: 10 }}>약 2분 소요 · Google Forms로 이동합니다</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)", borderBottom: "1px solid #ffffff15", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>S</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Sua AI</div>
            <div style={{ fontSize: 10, color: "#888", marginTop: -1 }}>F&B 경영개선 솔루션</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowFeedback(true)} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 16, padding: "6px 12px", fontSize: 11, color: "#fff", fontWeight: 700, cursor: "pointer" }}>💬 피드백</button>
          <div style={{ background: "#6366f115", border: "1px solid #6366f130", borderRadius: 16, padding: "4px 10px", fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>v2.1</div>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: "16px 16px 100px" }}>
        {tab === 0 && (
          <div>
            <div style={card}>
              <h3 style={secTitle}>메뉴 정보</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={lbl}>메뉴명</label><input value={menuName} onChange={e => setMenuName(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>판매가격 (원)</label><input type="number" value={sellingPrice} onChange={e => setSellingPrice(parseFloat(e.target.value)||0)} style={inp} /></div>
              </div>
            </div>

            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ ...secTitle, marginBottom: 0 }}>식재료 구성</h3>
                <button onClick={addIngredient} style={{ background: "#6366f115", border: "1px solid #6366f130", color: "#a5b4fc", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ 추가</button>
              </div>
              {ingredients.map(ing => (
                <div key={ing.id} style={{ background: "#ffffff05", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginBottom: 8 }}>
                    <input value={ing.name} onChange={e => updateIngredient(ing.id, "name", e.target.value)} style={inp} placeholder="재료명" />
                    <select value={ing.unit} onChange={e => updateIngredient(ing.id, "unit", e.target.value)} style={{ ...inp, width: 60, padding: "10px 6px" }}>{["g","ml","개","kg","L"].map(u => <option key={u}>{u}</option>)}</select>
                    <button onClick={() => removeIngredient(ing.id)} style={{ background: "#ff444420", border: "1px solid #ff444430", color: "#ff7777", borderRadius: 6, cursor: "pointer", padding: "0 10px", fontSize: 14 }}>✕</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><label style={lbl}>단가 (원/단위)</label><input type="number" value={ing.unitCost} onChange={e => updateIngredient(ing.id, "unitCost", e.target.value)} style={inp} step="0.001" /></div>
                    <div><label style={lbl}>사용량</label><input type="number" value={ing.quantity} onChange={e => updateIngredient(ing.id, "quantity", e.target.value)} style={inp} /></div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #ffffff10", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#888", fontSize: 12 }}>식재료 합계</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#a5b4fc" }}>{formatKRW(totalIngredientCost)}</span>
              </div>
            </div>

            <div style={{ ...card, border: "1px solid #6366f130" }}>
              <h3 style={secTitle}>간접비용</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={lbl}>인건비율 (자동)</label><div style={{ ...inp, background: "#6366f110", border: "1px solid #6366f130", color: "#a5b4fc", fontWeight: 700, fontSize: 13 }}>{laborRate.toFixed(1)}%</div></div>
                <div><label style={lbl}>기타경비율 (%)</label><input type="number" value={overheadRate} onChange={e => setOverheadRate(parseFloat(e.target.value)||0)} style={inp} /></div>
              </div>
            </div>

            <div style={{ ...card, background: "linear-gradient(160deg,#1e1e32 0%,#16213e 100%)", border: "1px solid #6366f130" }}>
              <h3 style={secTitle}>원가 분석 결과</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: `conic-gradient(${rating.color} ${Math.min(costRate,100)}%, #ffffff10 0)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 20px ${rating.color}40` }}>
                  <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#13131f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: rating.color }}>{costRate.toFixed(1)}%</div>
                    <div style={{ fontSize: 9, color: "#888" }}>식재료원가율</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "inline-block", background: `${rating.color}20`, border: `1px solid ${rating.color}40`, color: rating.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{rating.label}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>식재료 원가</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{formatKRW(totalIngredientCost)}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "식재료 원가", value: formatKRW(totalIngredientCost), rate: `${costRate.toFixed(1)}%`, color: "#6366f1" },
                  { label: "인건비", value: formatKRW(totalLaborCost/(laborData.totalCovers||1)), rate: `${laborRate.toFixed(1)}%`, color: "#8b5cf6" },
                  { label: "기타경비", value: formatKRW(sellingPrice*overheadRate/100), rate: `${overheadRate}%`, color: "#a78bfa" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#ffffff05", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} /><span style={{ fontSize: 13, color: "#aaa" }}>{item.label}</span></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div><div style={{ fontSize: 11, color: item.color }}>{item.rate}</div></div>
                  </div>
                ))}
                <div style={{ padding: "12px 14px", background: `${primeRating.color}10`, border: `1px solid ${primeRating.color}30`, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: primeRating.color }}>⭐ Prime Cost</div><div style={{ fontSize: 10, color: "#666" }}>식재료+인건비 (권장 55~65%)</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 800, color: primeRating.color }}>{primeCost.toFixed(1)}%</div><div style={{ fontSize: 11, color: primeRating.color }}>{primeRating.label}</div></div>
                  </div>
                </div>
                <div style={{ padding: "14px", background: profitRate > 0 ? "#10b98115" : "#ef444415", border: `1px solid ${profitRate > 0 ? "#10b98130" : "#ef444430"}`, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>순이익</span>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 800, color: profitRate > 0 ? "#10b981" : "#ef4444" }}>{formatKRW(profitAmount)}</div><div style={{ fontSize: 12, color: profitRate > 0 ? "#10b981" : "#ef4444" }}>{profitRate.toFixed(1)}%</div></div>
                  </div>
                </div>
              </div>
              <button onClick={saveMenu} style={{ width: "100%", marginTop: 14, padding: "15px", background: saved ? "#10b981" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.3s" }}>
                {saved ? "✓ 저장 완료!" : "메뉴 저장하기"}
              </button>
            </div>
          </div>
        )}

        {tab === 1 && <LaborTab laborData={laborData} setLaborData={setLaborData} />}

        {tab === 2 && (
          <div style={card}>
            <h3 style={secTitle}>저장된 메뉴 ({menus.length}개)</h3>
            {menus.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#555" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                <div>아직 저장된 메뉴가 없습니다</div>
                <div style={{ fontSize: 12, marginTop: 4, color: "#444" }}>원가계산 탭에서 저장해보세요</div>
              </div>
            ) : menus.map(m => {
              const r = getRating(parseFloat(m.costRate));
              const pr = getPrimeCostRating(parseFloat(m.primeCost));
              return (
                <div key={m.id} style={{ background: "#ffffff05", border: "1px solid #ffffff10", borderRadius: 12, padding: 16, marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.name}</div>
                  <div style={{ color: "#888", fontSize: 12, marginBottom: 12 }}>{formatKRW(m.sellingPrice)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[{ label: "식재료율", value: m.costRate+"%", color: r.color },{ label: "Prime Cost", value: m.primeCost+"%", color: pr.color },{ label: "순이익율", value: m.profitRate+"%", color: "#10b981" }].map((kpi, i) => (
                      <div key={i} style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30`, borderRadius: 8, padding: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                        <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>{kpi.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 3 && (
          <div>
            <div style={{ ...card, border: `1px solid ${primeRating.color}30` }}>
              <h3 style={secTitle}>⭐ Prime Cost 종합</h3>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: primeRating.color, lineHeight: 1 }}>{primeCost.toFixed(1)}%</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>식재료원가율 + 인건비율</div>
                <div style={{ display: "inline-block", background: `${primeRating.color}20`, border: `1px solid ${primeRating.color}40`, color: primeRating.color, borderRadius: 20, padding: "4px 16px", fontSize: 13, fontWeight: 700, marginTop: 10 }}>{primeRating.label}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "식재료 원가율", value: `${costRate.toFixed(1)}%`, color: "#6366f1" },
                  { label: "인건비율", value: `${laborRate.toFixed(1)}%`, color: "#8b5cf6" },
                  { label: "기타경비율", value: `${overheadRate}%`, color: "#a78bfa" },
                  { label: "순이익율", value: `${profitRate.toFixed(1)}%`, color: profitRate > 0 ? "#10b981" : "#ef4444" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "#ffffff05", borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: "#888" }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={card}>
              <h3 style={secTitle}>인건비 KPI</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "월 총 인건비", value: formatKRW(total
