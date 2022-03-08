library std;
use std.textio.all;
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
entity Testbench is
end entity;

architecture Behave of Testbench is
    component RLCompressor
        port (
            charIn:in std_logic_vector(7 downto 0);
            clk:in std_logic;
            rst:in std_logic;
            inputOver:in std_logic;
            dataValid:out std_logic;
            charOut:out std_logic_vector(7 downto 0)
        );
    end component;
    signal charInsg,charOutsg:std_logic_vector(7 downto 0);
    signal rstsg,clksg,inputOversg,dataValidSg:std_logic;
    function to_std_logic_vector(x:bit_vector) return std_logic_vector is
        variable ret_val:std_logic_vector((x'length-1) downto 0);
        begin
            for I in (x'length - 1) downto 0 loop
                if(x(I) = '1') then
                    ret_val(I):='1';
                else
                    ret_val(I):='0';
                end if;
            end loop;
            return ret_val;
    end to_std_logic_vector;
    function to_bit_vector(x:std_logic_vector) return bit_vector is
        variable ret_val:bit_vector((x'length-1) downto 0);
        begin
            for I in (x'length-1) downto 0 loop
                if(x(I) = '1') then
                    ret_val(I):='1';
                else
                    ret_val(I):='0';
                end if;
            end loop;
            return ret_val;
        end to_bit_vector;
begin
    i1:RLCompressor
    port map(charIn=>charInsg,clk=>clksg,rst=>rstsg,inputOver=>inputOversg,dataValid=>dataValidSg,charOut=>charOutsg);
    
    process
        File inf:text open read_mode is "C:/CODE/mycode/cs232/Labs/lab6/qfiles/input.txt";
        File outf:text open write_mode is "C:/CODE/mycode/cs232/Labs/lab6/qfiles/output.txt";
        variable charIn_vect:bit_vector(7 downto 0);
        variable INPUT_LINE:line;
        variable OUTPUT_LINE:line;
        variable LINE_COUNT:integer :=0;
        variable dinvCount:integer :=0;
    begin
        inputOversg<='0';
        clksg<='0';
        rstsg<='1';
        wait for 1 ns;
        clksg<='1';
        wait for 1 ns;
        rstsg<='0';
        while not endfile(inf) loop
            LINE_COUNT:=LINE_COUNT+1;
            readline(inf,INPUT_LINE);
            read(INPUT_LINE,charIn_vect);      
            charInsg<=to_std_logic_vector(charIn_vect);
            clksg<='0';
            wait for 1 ns;
            clksg<='1';
            wait for 1 ns;
            if(dataValidSg='1') then
                write(OUTPUT_LINE, to_bit_vector(charOutsg));
                writeline(outf,OUTPUT_LINE);
            end if;
        end loop;
        inputOversg<='1';
        while(dinvCount<8) loop
            clksg<='0';
            wait for 1 ns;
            clksg<='1';
            wait for 1 ns;
            if(dataValidSg='1') then
                dinvCount:=0;
                write(OUTPUT_LINE, to_bit_vector(charOutsg));
                writeline(outf,OUTPUT_LINE);
            else
                dinvCount:=dinvCount+1;
            end if;
        end loop;
        wait;
    end process;

end architecture Behave;