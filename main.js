"use strict";

const	MESHB = 8;
const	MESHH = 1 << MESHB >> 1;

let		gScene;


function CreateMap()
{
	TUG.BG.clearAtr( 1 );

	for( let n = 1, y = 5; y <= 14; y += 3 ){
		for( let x = 0; x < TUG.BG.mColumn; x++ ){
			if( n >= 0 ){
				TUG.BG.setAtr( x, y, 0 );
			}
			if( n-- < -Math.min( 10, TUG.Rnd( TUG.TX.mData[ 1 ].mVal ) ) ){
				n = TUG.Rnd( 2 );
			}
		}
	}

	TUG.SP.mData[ 1 ].mX = ( TUG.Rnd( 13 ) + 2 ) * TUG.BG.mWidth;
	TUG.SP.mData[ 1 ].mY = 1.5 * TUG.BG.mHeight;
}


function Move( p, left, right, jump )
{
	if( left ){
		p.mAtr = 0x01;
		if( p.mDX > -p.mSpeed ){
			p.mDX--;
		}
	}else if( right ){
		p.mAtr = 0x00;
		if( p.mDX < p.mSpeed ){
			p.mDX++;
		}
	}else{
		p.mDX -= TUG.Sign( p.mDX );
	}

	if( p.mDY < 64 ){
		p.mDY += 2;
	}
	if( p.mGr && p.mGr < 16 && p.mGr == jump ){
		p.mGr++;
		p.mDY = -36;
	}else{
		p.mGr = 0;
	}

	p.mWX += p.mDX;
	p.mWX &= 0xfff;

	let		mx0 = ( p.mWX - 16 * 7 ) >> 8;
	let		mx1 = ( p.mWX + 16 * 6 ) >> 8;
	let		my0 = p.mWY - MESHH >> 8;
	let		my1 = p.mWY + MESHH - 1 >> 8;
	mx0 &= TUG.BG.mColumn - 1;
	mx1 &= TUG.BG.mColumn - 1;

	for( let y = my0; y <= my1; y++ ){
		if( !TUG.BG.getAtr( mx0, y ) ){
			if( p.mDX < 0 ){
				p.mDX = 0;
			}
			let		d = p.mSpeed - p.mDX;
			if( d > 0 ){
				p.mWX += d;
			}
		}
		if( !TUG.BG.getAtr( mx1, y ) ){
			if( p.mDX > 0 ){
				p.mDX = 0;
			}
			let		d = p.mSpeed + p.mDX;
			if( d > 0 ){
				p.mWX -= d;
			}
		}
	}

	p.mWY += p.mDY;

	if( p.mDY < 0 ){
		my0 = p.mWY - MESHH >> 8;
		if( !TUG.BG.getAtr( p.mWX >> 8, my0 ) ){
			p.mWY = ToW( my0 + 1 );
			p.mDY = 0;
			p.mGr = 0;
		}
	}else{
		mx0 = ( p.mWX - 16 * 7 ) >> 8;
		mx1 = ( p.mWX + 16 * 6 ) >> 8;
		my1 = p.mWY + MESHH - 1 >> 8;
		mx0 &= TUG.BG.mColumn - 1;
		mx1 &= TUG.BG.mColumn - 1;
		if( !TUG.BG.getAtr( mx0, my1 ) || !TUG.BG.getAtr( mx1, my1 ) ){
			p.mWY = ToW( my1 - 1 );
			p.mDY = 0;
			p.mGr = 1;
		}
	}

	p.mX = ( ( p.mWX * TUG.BG.mWidth  ) >> MESHB ) - TUG.BG.mX;
	p.mY = ( ( p.mWY * TUG.BG.mHeight ) >> MESHB ) - TUG.BG.mY;
	p.mIdx = ( p.mX >> 2 ) & 1;
}


function NextStage()
{
	TUG.TX.mData[ 1 ].mVal++;
	CreateMap();
	gScene = 1;

	let		x = 2;
	while( TUG.BG.getAtr( x, 14 ) ){
		x++;
	}
	TUG.SP.mData[ 0 ].mWX = ToW( x );
	TUG.SP.mData[ 0 ].mWY = ToW( 13 );
	TUG.SP.mData[ 0 ].mDX = 0;
	TUG.SP.mData[ 0 ].mDY = 0;
}


function ToW( val )
{
	return( val << MESHB | MESHH );
}


TUG.onTimer = function()
{
	if( gScene >= 3 ){
		if( ++ gScene > 120 ){
			NextStage();
		}
	}

	if( gScene == 2 && TUG.PAD.A == 1 ){
		TUG.TX.mData[ 1 ].mVal = 0;
		NextStage();
	}

	if( gScene != 1 ){
		return;
	}

	Move( TUG.SP.mData[ 0 ], TUG.PAD.Left, TUG.PAD.Right, TUG.PAD.A );

	if( TUG.SP.mData[ 0 ].mWY >> MESHB > TUG.BG.mRow - 2 ){
		gScene = 2;
	}

	if( TUG.SP.mData[ 0 ].collision( TUG.SP.mData[ 1 ] ) ){
		gScene = 3;
	}
}


window.onload = function()
{
	TUG.init( "main", 240, 180, 16, 14, 16, 16 );
	TUG.BG.mX = 8;
	TUG.BG.mY = 28;

	TUG.TX.add( TUG.TX.createStr( "ＳＴＡＧＥ", 80, 0, "#ffaa00" ) );
	TUG.TX.add( TUG.TX.createIntZen( 0, 136, 0, "#ffffff" ) );

	TUG.LoadImage( [ "img/map.png", "img/player.png" ], function( e )
	{
		if( !e.AllComplete ){
			return;
		}

		TUG.BG.setImage( e.Result[ 0 ] );
		TUG.SP.add( TUG.SP.create( TUG.createTile( e.Result[ 1 ] ) ) );
		TUG.SP.mData[ 0 ].mSpeed = 16;
		TUG.SP.add( TUG.SP.create( TUG.createTile( e.Result[ 0 ] ), 1 ) );
		TUG.SP.mData[ 1 ].mWidth = 4;
		TUG.SP.mData[ 1 ].mHeight = 8;

		NextStage();
	} );
}

