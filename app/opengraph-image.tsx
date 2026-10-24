import {ImageResponse} from 'next/og';
import {PackVisual} from '@/src/components/PackVisual';
export const size={width:1200,height:630}; export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'space-around',background:'#FFF8F3',color:'#1A1A1A',fontSize:52,fontWeight:700}}><span>Hiper Pozuelo</span><PackVisual slug="completo" units={52} size="hero"/></div>,size)}
