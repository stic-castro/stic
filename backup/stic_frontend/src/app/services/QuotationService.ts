export const fetchAllQuotations = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL + "/catalog" || '';;

    try {
        // Fetch all three types in parallel
        const [spacersRes, gearsRes, pulleysRes] = await Promise.all([
            fetch(`${baseUrl}/api/quotation/Gear`),
            fetch(`${baseUrl}/api/quotation/Pulley`),
            fetch(`${baseUrl}/api/quotation/Spacer`)
        ]);

        // Check if all requests were successful
        const spacers = spacersRes.ok ? await spacersRes.json() : [];
        const gears = gearsRes.ok ? await gearsRes.json() : [];
        const pulleys = pulleysRes.ok ? await pulleysRes.json() : [];

        // Normalize data structure - add product type for display
        const normalizedSpacers = spacers.map((q: any) => ({
            ...q,
            productType: 'Separador'
        }));

        const normalizedGears = gears.map((q: any) => ({
            ...q,
            productType: 'Engranaje'
        }));

        const normalizedPulleys = pulleys.map((q: any) => ({
            ...q,
            productType: 'Polea'
        }));

        // Combine and sort by createdAt date (newest first)
        const allQuotations = [...normalizedSpacers, ...normalizedGears, ...normalizedPulleys];

        return allQuotations.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Newest first
        });
    } catch (error) {
        console.error("Error fetching quotations:", error);
        return [];
    }
};
