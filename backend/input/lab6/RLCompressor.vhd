library IEEE;
use IEEE.std_logic_unsigned.all;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
entity RLCompressor is
    port (
        charIn:in std_logic_vector(7 downto 0);
        clk:in std_logic;
        rst:in std_logic;
        inputOver:in std_logic;
        dataValid:out std_logic;
        charOut:out std_logic_vector(7 downto 0)
    );
end entity RLCompressor;
architecture compress of RLCompressor is
    signal charbuf,cntbuf:std_logic_vector(7 downto 0);
    signal outbuf,newOutBuf:std_logic_vector(559 downto 0);
    signal escch,nextcnt:std_logic_vector(7 downto 0);
    signal inputOverStorage:std_logic;
    signal allZeros:std_logic_vector(559 downto 0);
begin
    escch<="00011011";
    allZeros<=(others=>'0');
    process(clk)
    begin
        if rising_edge(clk) then
            if rst='1' then
                charbuf<=(others=>'0');
                newOutBuf<=(others=>'0');
                cntbuf<=(others=>'0');
            else
                if(inputOverStorage='1') then
                    if(cntbuf="000000001") then
                        newOutBuf<=outbuf(551 downto 0)&charbuf;
                    else 
                        if(cntbuf="00000010") then
                            newOutBuf<=outbuf(543 downto 0)&charbuf&charbuf;
                        else
                            newOutBuf<=outbuf(535 downto 0)&escch&cntbuf&charbuf;
                        end if;
                    end if;
                    charbuf<="00000000";
                else
                    if charIn=charbuf then
                        if(charbuf=escch)then
                            --package 6 esc's at most
                            if(cntbuf="00000110")then
                                newOutBuf<=outbuf(535 downto 0)&escch&cntbuf&charbuf;
                            else
                                newOutBuf<=outbuf;
                            end if;
                        else
                            --package five chars at most
                            if(cntbuf="00000101")then
                                newOutBuf<=outbuf(535 downto 0)&escch&cntbuf&charbuf;
                            else
                                newOutBuf<=outbuf;
                            end if;    
                        end if;
                        cntbuf<=(nextcnt);
                    else
                        if(charbuf = "00000000") then
                            charbuf<=charIn;
                            cntbuf<="00000001";
                            newOutBuf<=outbuf;
                        else
                            if(charbuf=escch)then
                                newOutBuf<=outbuf(535 downto 0)&escch&cntbuf&charbuf;
                            else
                                if(cntbuf="000000001") then
                                    newOutBuf<=outbuf(551 downto 0)&charbuf;
                                else 
                                    if(cntbuf="00000010") then
                                        newOutBuf<=outbuf(543 downto 0)&charbuf&charbuf;
                                    else
                                        newOutBuf<=outbuf(535 downto 0)&escch&cntbuf&charbuf;
                                    end if;
                                end if;
                            end if;
                            charbuf<=charIn;
                            cntbuf<="00000001";
                        end if;
                    end if;
                end if;
            end if;
        end if;
    end process;

    process(cntbuf)
    begin
        if cntbuf = "00000101" then
            if(charbuf /= escch) then
                nextcnt<="00000001";
            else
                nextcnt<=cntbuf + "00000001";            
            end if;
        else
            if(cntbuf = "00000110") then
                nextcnt<="00000001";
            else
                nextcnt<=cntbuf + "00000001";
            end if;
            
        end if;
    end process;
    
    process(newOutBuf)
    begin
        if(rst='1') then
            dataValid<='0';
            charOut<="00000000";
            outbuf<=(others=>'0');
        else
            if(inputOverStorage='1' and newOutBuf=allZeros) then
                dataValid<='0';
            else
                for x in 70 downto 1 loop
                    report "x = "&integer'image(x);
                    if(newOutBuf(((8*x)-1) downto ((8*x)-8)) /= "00000000") then
                        dataValid<='1';
                        charOut<=newOutBuf(((8*x)-1) downto ((8*x)-8));
                        if(x>1) then
                            if(x<70) then
                                outbuf<= newOutBuf(559 downto 8*x)&"00000000"&newOutBuf(((8*x)-9) downto 0);
                            else
                                outbuf<="00000000"&newOutBuf(551 downto 0);
                            end if;
                        else
                            outbuf<=newOutBuf(559 downto 8)&"00000000";
                        end if;
                        exit;
                    end if;
                    if(x=1) then
                        dataValid<='0';
                    end if;
                end loop;     
            end if; 
        end if;

    end process;
    process(inputOver,rst)
    begin
        if(rst='1')then
            inputOverStorage<='0';
        else
            if(inputOver='1') then
                inputOverStorage<=inputOver;
            end if;
        end if;
    end process;
end architecture compress;