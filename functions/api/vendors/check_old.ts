interface Env {
  DB: D1Database;
}

interface VendorPayload {
  businessNumber: string;
  businessName: string;
}

interface VendorRecord {
  id: number;
  business_number: string;
  name: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const { businessNumber, businessName } = await request.json<VendorPayload>();

    if (!businessNumber || !businessName) {
      return new Response(JSON.stringify({ success: false, message: "사업자등록번호와 상호는 필수입니다." }), { status: 400 });
    }

    // 1. 사업자등록번호로 기존 거래처 조회
    const stmt = env.DB.prepare("SELECT * FROM Vendors WHERE business_number = ?");
    let vendor = await stmt.bind(businessNumber).first<VendorRecord>();

    // 2. 거래처가 없으면 새로 생성
    if (!vendor) {
      const insertStmt = env.DB.prepare("INSERT INTO Vendors (business_number, name) VALUES (?, ?)");
      const { success } = await insertStmt.bind(businessNumber, businessName).run();
      if (!success) {
        throw new Error("Failed to create new vendor.");
      }
      // 방금 생성한 거래처 정보를 다시 조회
      vendor = await stmt.bind(businessNumber).first<VendorRecord>();
    }

    if (!vendor) {
      throw new Error("Failed to retrieve vendor information after creation.");
    }

    return new Response(JSON.stringify({ success: true, vendor }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: "서버 오류가 발생했습니다." }), { status: 500 });
  }
};