import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '0');
    
    const query: any = {};
    if (category) {
      query.category = category;
    }
    
    let productsQuery = Product.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      productsQuery = productsQuery.limit(limit);
    }
    
    const products = await productsQuery.lean();
    
    return NextResponse.json(JSON.parse(JSON.stringify(products)));
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
